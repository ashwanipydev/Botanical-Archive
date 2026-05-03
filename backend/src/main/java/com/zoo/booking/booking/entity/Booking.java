package com.zoo.booking.booking.entity;
import com.zoo.booking.auth.entity.User;
import com.zoo.booking.slot.entity.Slot;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Booking {

    private Long id;

    private User user;

    private Slot slot;

    private Integer adultTickets;
    
    private Integer childTickets;
    
    private Integer addOnCamera;
    
    private Integer addOnSafari;

    private Double totalAmount;

    // e.g. PENDING, CONFIRMED, FAILED
    private String status;

    private String razorpayOrderId;
    
    private String razorpayPaymentId;

    private String qrCodeUrl;
    private String pdfUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Expiry for pending bookings
    private LocalDateTime expiryTime;

    // Guest information for non-logged-in bookings
    private String guestFullName;
    private String guestEmail;
    private String guestMobileNumber;

    private LocalDateTime checkedInAt;
    private LocalDateTime checkedOutAt;
}
