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

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

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

            Context context = new Context();
            context.setVariable("fullName", fullName != null ? fullName : "Guest");
            context.setVariable("bookingId", booking.getId());
            context.setVariable("visitDate", booking.getSlot().getSlotDate() != null ? 
                booking.getSlot().getSlotDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")) : "N/A");
            context.setVariable("timeSlot", (booking.getSlot().getStartTime() != null && booking.getSlot().getEndTime() != null) ? 
                booking.getSlot().getStartTime() + " - " + booking.getSlot().getEndTime() : "N/A");
            context.setVariable("adultCount", booking.getAdultTickets() != null ? booking.getAdultTickets() : 0);
            context.setVariable("childCount", booking.getChildTickets() != null ? booking.getChildTickets() : 0);
            context.setVariable("safari", booking.getAddOnSafari() != null && booking.getAddOnSafari() > 0);
            context.setVariable("camera", booking.getAddOnCamera() != null && booking.getAddOnCamera() > 0);
            context.setVariable("totalAmount", booking.getTotalAmount() != null ? String.format("%.2f", booking.getTotalAmount()) : "0.00");

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
