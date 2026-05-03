package com.zoo.booking.scheduler;

import com.zoo.booking.booking.entity.Booking;
import com.zoo.booking.booking.repository.BookingRepository;
import com.zoo.booking.booking.service.BookingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
public class BookingExpiryScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    /**
     * Run every 2 minutes to check for expired pending bookings.
     * Mark them as EXPIRED and release capacity.
     */
    @Scheduled(fixedDelay = 120000, initialDelay = 60000) // 2 minutes, 1 minute initial delay
    public void handleExpiredBookings() {
        log.info("Running expired booking handler...");

        try {
            LocalDateTime currentTime = LocalDateTime.now();
            List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(currentTime);

            log.info("Found {} expired pending bookings", expiredBookings.size());

            for (Booking booking : expiredBookings) {
                try {
                    // Fail the booking and release capacity
                    bookingService.failBooking(booking.getId(), "BOOKING_EXPIRED");

                    log.info("Expired booking {} has been processed", booking.getId());
                } catch (Exception e) {
                    log.error("Error processing expired booking: {}", booking.getId(), e);
                }
            }

            log.info("Expired booking handler completed");
        } catch (Exception e) {
            log.error("Error in expired booking scheduler", e);
        }
    }
}

