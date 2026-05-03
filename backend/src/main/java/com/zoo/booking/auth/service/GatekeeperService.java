package com.zoo.booking.auth.service;

import com.zoo.booking.booking.entity.Booking;
import com.zoo.booking.booking.repository.BookingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class GatekeeperService {

    private final BookingRepository bookingRepository;

    public GatekeeperService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Verify a ticket's validity for entry.
     */
    public Map<String, Object> verifyTicket(Long bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        
        if (bookingOpt.isEmpty()) {
            return Map.of("valid", false, "message", "Ticket not found");
        }

        Booking booking = bookingOpt.get();
        LocalDate today = LocalDate.now();

        if (!"CONFIRMED".equals(booking.getStatus())) {
            return Map.of("valid", false, "message", "Ticket is not in CONFIRMED status: " + booking.getStatus());
        }

        if (!booking.getSlot().getSlotDate().equals(today)) {
            return Map.of("valid", false, "message", "Ticket is for date: " + booking.getSlot().getSlotDate());
        }

        return Map.of(
            "valid", true,
            "bookingId", booking.getId(),
            "guestName", booking.getGuestFullName(),
            "tickets", Map.of("adults", booking.getAdultTickets(), "children", booking.getChildTickets()),
            "checkedInAt", booking.getCheckedInAt() != null ? booking.getCheckedInAt() : "NOT_IN",
            "checkedOutAt", booking.getCheckedOutAt() != null ? booking.getCheckedOutAt() : "NOT_OUT"
        );
    }

    /**
     * Register entry of a visitor.
     */
    @Transactional
    public Map<String, Object> checkIn(Long bookingId) {
        int updated = bookingRepository.updateCheckInTime(bookingId, LocalDateTime.now());
        if (updated > 0) {
            return Map.of("success", true, "message", "Visitor checked in successfully");
        }
        
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        if (booking.isPresent() && booking.get().getCheckedInAt() != null) {
            return Map.of("success", false, "message", "Visitor already checked in at " + booking.get().getCheckedInAt());
        }
        
        return Map.of("success", false, "message", "Failed to check in. Verify ticket status.");
    }

    /**
     * Register exit of a visitor.
     */
    @Transactional
    public Map<String, Object> checkOut(Long bookingId) {
        int updated = bookingRepository.updateCheckOutTime(bookingId, LocalDateTime.now());
        if (updated > 0) {
            return Map.of("success", true, "message", "Visitor checked out successfully");
        }

        Optional<Booking> booking = bookingRepository.findById(bookingId);
        if (booking.isPresent()) {
            if (booking.get().getCheckedInAt() == null) {
                return Map.of("success", false, "message", "Visitor has not checked in yet");
            }
            if (booking.get().getCheckedOutAt() != null) {
                return Map.of("success", false, "message", "Visitor already checked out at " + booking.get().getCheckedOutAt());
            }
        }

        return Map.of("success", false, "message", "Failed to check out.");
    }

    public int getCurrentOccupancy() {
        return bookingRepository.countCurrentlyCheckedIn();
    }
}
