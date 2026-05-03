package com.zoo.booking.booking.repository;

import com.zoo.booking.booking.entity.Booking;
import com.zoo.booking.slot.entity.Slot;
import com.zoo.booking.auth.entity.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class BookingRepository {
    private final JdbcTemplate jdbcTemplate;

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Booking> findById(Long id) {
        List<Booking> bookings = jdbcTemplate.query(
                baseSelectSql() + " WHERE b.id = ?",
                BOOKING_ROW_MAPPER,
                id
        );
        return bookings.stream().findFirst();
    }

    public Optional<Booking> findByIdForUpdate(Long id) {
        List<Booking> bookings = jdbcTemplate.query(
                baseSelectSql() + " WHERE b.id = ? FOR UPDATE OF b",
                BOOKING_ROW_MAPPER,
                id
        );
        return bookings.stream().findFirst();
    }

    public List<Booking> findByUser(User user) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("User is required");
        }
        return jdbcTemplate.query(
                baseSelectSql() + " WHERE b.user_id = ? ORDER BY b.id DESC",
                BOOKING_ROW_MAPPER,
                user.getId()
        );
    }

    public Optional<Booking> findByRazorpayOrderId(String orderId) {
        List<Booking> bookings = jdbcTemplate.query(
                baseSelectSql() + " WHERE b.razorpay_order_id = ?",
                BOOKING_ROW_MAPPER,
                orderId
        );
        return bookings.stream().findFirst();
    }

    public List<Booking> findAll() {
        return jdbcTemplate.query(
                baseSelectSql() + " ORDER BY b.id DESC",
                BOOKING_ROW_MAPPER
        );
    }

    public List<Booking> findExpiredPendingBookings(LocalDateTime currentTime) {
        return jdbcTemplate.query(
                baseSelectSql() + " WHERE b.status = 'PENDING' AND b.expiry_time IS NOT NULL AND b.expiry_time < ? ORDER BY b.expiry_time ASC",
                BOOKING_ROW_MAPPER,
                toTimestamp(currentTime)
        );
    }

    public Booking save(Booking booking) {
        if (booking.getUser() == null || booking.getUser().getId() == null) {
            throw new IllegalArgumentException("Booking.user.id is required");
        }
        if (booking.getSlot() == null || booking.getSlot().getId() == null) {
            throw new IllegalArgumentException("Booking.slot.id is required");
        }

        if (booking.getId() == null) {
            Long id = jdbcTemplate.queryForObject(
                    "INSERT INTO bookings (" +
                            "user_id, slot_id, adult_tickets, child_tickets, add_on_camera, add_on_safari, total_amount, status, " +
                            "razorpay_order_id, razorpay_payment_id, qr_code_url, pdf_url, created_at, expiry_time, " +
                            "guest_full_name, guest_email, guest_mobile_number, checked_in_at, checked_out_at" +
                            ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                    Long.class,
                    booking.getUser().getId(),
                    booking.getSlot().getId(),
                    booking.getAdultTickets(),
                    booking.getChildTickets(),
                    defaultZero(booking.getAddOnCamera()),
                    defaultZero(booking.getAddOnSafari()),
                    booking.getTotalAmount() != null ? booking.getTotalAmount() : 0.0,
                    booking.getStatus(),
                    booking.getRazorpayOrderId(),
                    booking.getRazorpayPaymentId(),
                    booking.getQrCodeUrl(),
                    booking.getPdfUrl(),
                    toTimestamp(booking.getCreatedAt()),
                    toTimestamp(booking.getExpiryTime()),
                    booking.getGuestFullName(),
                    booking.getGuestEmail(),
                    booking.getGuestMobileNumber(),
                    toTimestamp(booking.getCheckedInAt()),
                    toTimestamp(booking.getCheckedOutAt())
            );
            booking.setId(id);
            return booking;
        }

        jdbcTemplate.update(
                "UPDATE bookings SET " +
                        "user_id = ?, slot_id = ?, adult_tickets = ?, child_tickets = ?, add_on_camera = ?, add_on_safari = ?, total_amount = ?, status = ?, " +
                        "razorpay_order_id = ?, razorpay_payment_id = ?, qr_code_url = ?, pdf_url = ?, expiry_time = ?, " +
                        "guest_full_name = ?, guest_email = ?, guest_mobile_number = ?, " +
                        "checked_in_at = ?, checked_out_at = ? " +
                        "WHERE id = ?",
                booking.getUser().getId(),
                booking.getSlot().getId(),
                booking.getAdultTickets(),
                booking.getChildTickets(),
                defaultZero(booking.getAddOnCamera()),
                defaultZero(booking.getAddOnSafari()),
                booking.getTotalAmount() != null ? booking.getTotalAmount() : 0.0,
                booking.getStatus(),
                booking.getRazorpayOrderId(),
                booking.getRazorpayPaymentId(),
                booking.getQrCodeUrl(),
                booking.getPdfUrl(),
                toTimestamp(booking.getExpiryTime()),
                booking.getGuestFullName(),
                booking.getGuestEmail(),
                booking.getGuestMobileNumber(),
                toTimestamp(booking.getCheckedInAt()),
                toTimestamp(booking.getCheckedOutAt()),
                booking.getId()
        );
        return booking;
    }

    public int updateStatusIfCurrent(Long bookingId, String expectedStatus, String newStatus) {
        return jdbcTemplate.update(
                "UPDATE bookings SET status = ? WHERE id = ? AND status = ?",
                newStatus,
                bookingId,
                expectedStatus
        );
    }

    public int updatePaymentAndStatusIfPending(Long bookingId, String paymentId) {
        return jdbcTemplate.update(
                "UPDATE bookings SET status = 'CONFIRMED', razorpay_payment_id = ? WHERE id = ? AND status = 'PENDING'",
                paymentId,
                bookingId
        );
    }

    public int updatePdfUrl(Long bookingId, String pdfUrl) {
        return jdbcTemplate.update(
                "UPDATE bookings SET pdf_url = ? WHERE id = ?",
                pdfUrl,
                bookingId
        );
    }

    public int updateCheckInTime(Long bookingId, LocalDateTime time) {
        return jdbcTemplate.update(
                "UPDATE bookings SET checked_in_at = ? WHERE id = ? AND checked_in_at IS NULL",
                toTimestamp(time),
                bookingId
        );
    }

    public int updateCheckOutTime(Long bookingId, LocalDateTime time) {
        return jdbcTemplate.update(
                "UPDATE bookings SET checked_out_at = ? WHERE id = ? AND checked_in_at IS NOT NULL AND checked_out_at IS NULL",
                toTimestamp(time),
                bookingId
        );
    }

    public int countCurrentlyCheckedIn() {
        Integer adults = jdbcTemplate.queryForObject(
                "SELECT SUM(adult_tickets) FROM bookings WHERE checked_in_at IS NOT NULL AND checked_out_at IS NULL AND status = 'CONFIRMED'",
                Integer.class
        );
        Integer children = jdbcTemplate.queryForObject(
                "SELECT SUM(child_tickets) FROM bookings WHERE checked_in_at IS NOT NULL AND checked_out_at IS NULL AND status = 'CONFIRMED'",
                Integer.class
        );
        return (adults != null ? adults : 0) + (children != null ? children : 0);
    }

    private static final RowMapper<Booking> BOOKING_ROW_MAPPER = (rs, rowNum) -> mapBooking(rs);

    private static Booking mapBooking(ResultSet rs) throws java.sql.SQLException {
        Booking booking = new Booking();
        booking.setId(rs.getLong("b_id"));
        booking.setAdultTickets((Integer) rs.getObject("adult_tickets"));
        booking.setChildTickets((Integer) rs.getObject("child_tickets"));
        booking.setAddOnCamera((Integer) rs.getObject("add_on_camera"));
        booking.setAddOnSafari((Integer) rs.getObject("add_on_safari"));

        java.math.BigDecimal totalAmountDecimal = rs.getBigDecimal("total_amount");
        booking.setTotalAmount(totalAmountDecimal != null ? totalAmountDecimal.doubleValue() : null);

        booking.setStatus(rs.getString("status"));
        booking.setRazorpayOrderId(rs.getString("razorpay_order_id"));
        booking.setRazorpayPaymentId(rs.getString("razorpay_payment_id"));
        booking.setQrCodeUrl(rs.getString("qr_code_url"));
        booking.setPdfUrl(rs.getString("pdf_url"));
        booking.setGuestFullName(rs.getString("guest_full_name"));
        booking.setGuestEmail(rs.getString("guest_email"));
        booking.setGuestMobileNumber(rs.getString("guest_mobile_number"));

        OffsetDateTime createdAt = rs.getObject("created_at", OffsetDateTime.class);
        booking.setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null);

        OffsetDateTime expiryTime = rs.getObject("expiry_time", OffsetDateTime.class);
        booking.setExpiryTime(expiryTime != null ? expiryTime.toLocalDateTime() : null);

        OffsetDateTime checkedInAt = rs.getObject("checked_in_at", OffsetDateTime.class);
        booking.setCheckedInAt(checkedInAt != null ? checkedInAt.toLocalDateTime() : null);

        OffsetDateTime checkedOutAt = rs.getObject("checked_out_at", OffsetDateTime.class);
        booking.setCheckedOutAt(checkedOutAt != null ? checkedOutAt.toLocalDateTime() : null);

        User user = new User();
        user.setId(rs.getLong("u_id"));
        user.setFullName(rs.getString("u_full_name"));
        user.setEmail(rs.getString("u_email"));
        user.setMobileNumber(rs.getString("u_mobile_number"));
        booking.setUser(user);

        Slot slot = new Slot();
        slot.setId(rs.getLong("s_id"));
        slot.setSlotDate(rs.getObject("slot_date", LocalDate.class));
        slot.setStartTime(rs.getObject("start_time", LocalTime.class));
        slot.setEndTime(rs.getObject("end_time", LocalTime.class));
        slot.setTotalCapacity((Integer) rs.getObject("total_capacity"));
        slot.setAvailableCapacity((Integer) rs.getObject("available_capacity"));
        slot.setIsActive((Boolean) rs.getObject("is_active"));
        booking.setSlot(slot);

        return booking;
    }

    private String baseSelectSql() {
        return "SELECT " +
                "b.id AS b_id, b.user_id, b.slot_id, b.adult_tickets, b.child_tickets, b.add_on_camera, b.add_on_safari, " +
                "b.total_amount, b.status, b.razorpay_order_id, b.razorpay_payment_id, b.qr_code_url, b.pdf_url, " +
                "b.created_at, b.expiry_time, b.guest_full_name, b.guest_email, b.guest_mobile_number, " +
                "b.checked_in_at, b.checked_out_at, " +
                "u.id AS u_id, u.full_name AS u_full_name, u.email AS u_email, u.mobile_number AS u_mobile_number, " +
                "s.id AS s_id, s.slot_date, s.start_time, s.end_time, s.total_capacity, s.available_capacity, s.is_active " +
                "FROM bookings b " +
                "JOIN users u ON u.id = b.user_id " +
                "JOIN slots s ON s.id = b.slot_id";
    }

    private static Integer defaultZero(Integer value) {
        return value != null ? value : 0;
    }

    private Timestamp toTimestamp(LocalDateTime value) {
        return value != null ? Timestamp.valueOf(value) : null;
    }
}
