package com.zoo.booking.booking.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public class BookingAddOnRepository {
    public record BookingAddOnReservation(Long addOnId, String addOnName, Integer quantity, BigDecimal unitPrice) {}

    private static final RowMapper<BookingAddOnReservation> RESERVATION_ROW_MAPPER =
            (rs, rowNum) -> new BookingAddOnReservation(
                    rs.getLong("add_on_id"),
                    rs.getString("name"),
                    (Integer) rs.getObject("quantity"),
                    rs.getObject("unit_price", BigDecimal.class)
            );

    private final JdbcTemplate jdbcTemplate;

    public BookingAddOnRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void deleteByBookingId(Long bookingId) {
        jdbcTemplate.update("DELETE FROM booking_add_ons WHERE booking_id = ?", bookingId);
    }

    public void insert(Long bookingId, Long addOnId, Integer quantity, BigDecimal unitPrice) {
        jdbcTemplate.update(
                "INSERT INTO booking_add_ons (booking_id, add_on_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                bookingId,
                addOnId,
                quantity,
                unitPrice
        );
    }

    public List<BookingAddOnReservation> findByBookingId(Long bookingId) {
        return jdbcTemplate.query(
                "SELECT ba.add_on_id, a.name, ba.quantity, ba.unit_price " +
                        "FROM booking_add_ons ba " +
                        "JOIN add_on_master a ON a.id = ba.add_on_id " +
                        "WHERE ba.booking_id = ?",
                RESERVATION_ROW_MAPPER,
                bookingId
        );
    }
}

