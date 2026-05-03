package com.zoo.booking.booking.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingAudit {

    private Long id;

    private Long bookingId;

    private String requestPayload;

    private String priceBreakdown;

    private String paymentResponse;

    private String status; // CREATED, PAYMENT_INITIATED, PAYMENT_SUCCESS, PAYMENT_FAILED, EXPIRED

    private String errorMessage;

    private LocalDateTime createdAt = LocalDateTime.now();
}

