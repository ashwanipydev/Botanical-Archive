package com.zoo.booking.system.service;

import com.zoo.booking.booking.entity.Booking;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    public void sendBookingConfirmation(Booking booking) {
        try {
            String recipientEmail = booking.getUser().getEmail();
            String fullName = booking.getUser().getFullName();

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("bookingId", booking.getId());
            context.setVariable("visitDate", booking.getSlot().getSlotDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
            context.setVariable("timeSlot", booking.getSlot().getStartTime() + " - " + booking.getSlot().getEndTime());
            context.setVariable("adultCount", booking.getAdultTickets());
            context.setVariable("childCount", booking.getChildTickets());
            context.setVariable("safari", booking.getAddOnSafari() > 0);
            context.setVariable("camera", booking.getAddOnCamera() > 0);
            context.setVariable("totalAmount", String.format("%.2f", booking.getTotalAmount()));

            String process = templateEngine.process("ticket-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom("dataman.uat@gmail.com", "Civic Naturalist Zoo");
            helper.setTo(recipientEmail);
            helper.setSubject("Zoo Ticket Confirmation - " + booking.getId());
            helper.setText(process, true);

            mailSender.send(mimeMessage);
            System.out.println("✅ Booking confirmation email sent to " + recipientEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send booking confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendResetPasswordEmail(String email, String token) {
        try {
            Context context = new Context();
            context.setVariable("email", email);
            context.setVariable("resetToken", token);
            context.setVariable("resetLink", "http://localhost:3000/reset-password?token=" + token);

            String process = templateEngine.process("reset-password-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("dataman.uat@gmail.com", "Civic Naturalist Zoo");
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
