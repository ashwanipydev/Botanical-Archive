package com.zoo.booking.payment.controller;

import com.zoo.booking.booking.entity.Booking;
import com.zoo.booking.auth.payload.response.MessageResponse;
import com.zoo.booking.booking.service.BookingService;
import com.zoo.booking.payment.service.RazorpayService;
import com.razorpay.Utils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Payment webhook and verification endpoints")
public class PaymentController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private RazorpayService razorpayService;

    @Value("${razorpay.webhook.secret:ZooWebhookSecret2026}")
    private String webhookSecret;

    @PostMapping("/confirm/{bookingId}")
    public ResponseEntity<?> confirmBooking(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> payload
    ) {
        String orderId = payload.get("razorpayOrderId");
        String paymentId = payload.get("razorpayPaymentId");
        String signature = payload.get("razorpaySignature");

        Map<String, String> result = razorpayService.verifyPayment(orderId, paymentId, signature);

        if (!"SUCCESS".equals(result.get("status"))) {
            return ResponseEntity.badRequest().body(result);
        }

        // ✅ Update booking status in DB
        bookingService.confirmBooking(bookingId, paymentId);

        return ResponseEntity.ok(Map.of(
                "bookingId", String.valueOf(bookingId),
                "status", "CONFIRMED"
        ));
    }

    /**
     * Webhook handler for Razorpay payment success callback.
     * This is the ONLY source of truth for payment success.
     */
    @PostMapping("/webhook/razorpay")
    @Operation(summary = "Razorpay Payment Webhook", description = "Webhook endpoint for Razorpay payment callbacks")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Webhook processed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid webhook signature"),
        @ApiResponse(responseCode = "500", description = "Error processing webhook")
    })
    public ResponseEntity<?> handleRazorpayWebhook(
            @RequestBody String body,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        log.info("Received Razorpay webhook signature review");

        try {
            // Verify webhook signature
            if (!verifyWebhookSignature(body, signature)) {
                log.warn("Webhook signature verification failed!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid webhook signature"));
            }

            // Parse body (This is a simplified manual parse, in production use a JSON library)
            // But since we have the body string, we'll extract order_id and event
            if (body.contains("payment.captured")) {
                 String orderId = extractField(body, "order_id");
                 String paymentId = extractField(body, "payment_id");
                 
                 log.info("Processing payment success for order: {}", orderId);
                 Long bookingId = extractBookingIdFromOrderId(orderId);
                 bookingService.confirmBooking(bookingId, paymentId);
                 return ResponseEntity.ok(new MessageResponse("Booking confirmed via webhook"));
            } else if (body.contains("payment.failed")) {
                 String orderId = extractField(body, "order_id");
                 log.warn("Processing payment failure for order: {}", orderId);
                 Long bookingId = extractBookingIdFromOrderId(orderId);
                 bookingService.failBooking(bookingId, "PAYMENT_FAILED_VIA_WEBHOOK");
                 return ResponseEntity.ok(new MessageResponse("Booking failed via webhook"));
            }

            return ResponseEntity.ok(new MessageResponse("Webhook processed"));
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error processing webhook: " + e.getMessage()));
        }
    }

    private boolean verifyWebhookSignature(String body, String signature) {
        try {
            return Utils.verifyWebhookSignature(body, signature, webhookSecret);
        } catch (Exception e) {
            log.error("Signature verification error", e);
            return false;
        }
    }

    private String extractField(String json, String field) {
        // Simple regex-based extraction for efficiency in this specific controller
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]+)\"");
        java.util.regex.Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private Long extractBookingIdFromOrderId(String orderId) {
        if (orderId == null) throw new RuntimeException("Order ID is null");
        try {
            // Format: order_{bookingId}_{timestamp} or just direct ID if configured differently
            String[] parts = orderId.split("_");
            if (parts.length >= 2) {
                return Long.parseLong(parts[1]);
            }
            // Fallback for simple numeric IDs
            return Long.parseLong(orderId.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            log.error("Error extracting booking ID from order: {}", orderId, e);
            throw new RuntimeException("Invalid order ID format");
        }
    }

    /**
     * Legacy payload class - kept for backward compatibility if needed, 
     * but we are using raw body for signature verification now.
     */
    @lombok.Data
    public static class RazorpayWebhookPayload {
        private String orderId;
        private String paymentId;
        private String status;
        private String failureReason;
    }
}

