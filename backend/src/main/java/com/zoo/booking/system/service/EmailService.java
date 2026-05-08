package com.zoo.booking.system.service;

import com.zoo.booking.booking.entity.Booking;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    private com.zoo.booking.booking.repository.BookingAddOnRepository bookingAddOnRepository;

    @Autowired
    private com.zoo.booking.pricing.service.PricingService pricingService;

    @Async
    public void sendBookingConfirmation(Booking booking, String pdfPath) {
        try {
            String recipientEmail = booking.getUser().getEmail();
            String fullName = booking.getUser().getFullName();
            
            System.out.println("📧 Attempting to send booking confirmation to: " + recipientEmail + " for booking ID: " + booking.getId());

            if (booking.getSlot() == null) {
                System.err.println("❌ Cannot send email: Slot is null for booking " + booking.getId());
                return;
            }

            // Fetch dynamic add-ons
            List<com.zoo.booking.booking.repository.BookingAddOnRepository.BookingAddOnReservation> addons = 
                bookingAddOnRepository.findByBookingId(booking.getId());

            Context context = new Context();
            context.setVariable("fullName", fullName != null ? fullName : "Guest");
            context.setVariable("bookingId", booking.getId());
            context.setVariable("visitDate", booking.getSlot().getSlotDate() != null ? 
                booking.getSlot().getSlotDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")) : "N/A");
            context.setVariable("timeSlot", (booking.getSlot().getStartTime() != null && booking.getSlot().getEndTime() != null) ? 
                booking.getSlot().getStartTime() + " - " + booking.getSlot().getEndTime() : "N/A");
            context.setVariable("adultCount", booking.getAdultTickets() != null ? booking.getAdultTickets() : 0);
            context.setVariable("childCount", booking.getChildTickets() != null ? booking.getChildTickets() : 0);
            
            // Pass the dynamic list of add-ons to the template
            context.setVariable("addons", addons);
            
            // Recalculate total for consistency
            double adultPrice = 800.0; // Fallback defaults
            double childPrice = 500.0;
            try {
                Map<String, Double> prices = pricingService.resolvePricesForSlot(booking.getSlot().getId());
                adultPrice = prices.getOrDefault("ADULT", 800.0);
                childPrice = prices.getOrDefault("CHILD", 500.0);
            } catch (Exception e) {
                // Keep defaults
            }
            
            double calculatedTotal = (adultPrice * (booking.getAdultTickets() != null ? booking.getAdultTickets() : 0)) + 
                                     (childPrice * (booking.getChildTickets() != null ? booking.getChildTickets() : 0));
            
            for (com.zoo.booking.booking.repository.BookingAddOnRepository.BookingAddOnReservation addon : addons) {
                calculatedTotal += addon.unitPrice().doubleValue() * (addon.quantity() != null ? addon.quantity() : 0);
            }
            calculatedTotal += 100.0; // Convenience fee

            context.setVariable("totalAmount", String.format("%.2f", calculatedTotal));

            String process = templateEngine.process("ticket-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Civic Naturalist Zoo");
            helper.setTo(recipientEmail);
            helper.setSubject("Zoo Ticket Confirmation - " + booking.getId());
            helper.setText(process, true);
            
            // Attach PDF ticket if it exists
            if (pdfPath != null) {
                java.io.File file = new java.io.File("tickets/" + pdfPath.substring(pdfPath.lastIndexOf("/") + 1));
                // Handle cases where pdfPath might be a relative URL or full path
                if (!file.exists()) {
                    file = new java.io.File(pdfPath);
                }
                
                if (file.exists()) {
                    helper.addAttachment("ZooTicket_" + booking.getId() + ".pdf", file);
                    System.out.println("📎 Attached PDF ticket: " + file.getAbsolutePath());
                } else {
                    System.err.println("⚠️ Could not find ticket file to attach: " + pdfPath);
                }
            }

            mailSender.send(mimeMessage);
            System.out.println("✅ Booking confirmation email successfully handed off to SMTP server for " + recipientEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send booking confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendResetPasswordEmail(String email, String token) {
        try {
            Context context = new Context();
            context.setVariable("email", email);
            context.setVariable("resetToken", token);
            context.setVariable("resetLink", "http://localhost:3000/reset-password?token=" + token);

            String process = templateEngine.process("reset-password-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "Civic Naturalist Zoo");
            helper.setTo(email);
            helper.setSubject("Password Reset Request - Civic Naturalist Zoo");
            helper.setText(process, true);

            mailSender.send(mimeMessage);
            System.out.println("✅ Password reset email sent to " + email);
        } catch (Exception e) {
            System.err.println("❌ Failed to send password reset email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
