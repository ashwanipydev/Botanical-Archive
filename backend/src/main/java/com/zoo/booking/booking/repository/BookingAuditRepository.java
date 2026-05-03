package com.zoo.booking.booking.repository;

import com.zoo.booking.booking.entity.BookingAudit;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Repository
public class BookingAuditRepository {
    private static final RowMapper<BookingAudit> BOOKING_AUDIT_ROW_MAPPER =
            (rs, rowNum) -> {
                BookingAudit audit = new BookingAudit();
                audit.setId(rs.getLong("id"));
                audit.setBookingId((Long) rs.getObject("booking_id"));
                audit.setRequestPayload(rs.getString("request_payload"));
                audit.setPriceBreakdown(rs.getString("price_breakdown"));
                audit.setPaymentResponse(rs.getString("payment_response"));
                audit.setStatus(rs.getString("status"));
                audit.setErrorMessage(rs.getString("error_message"));

                OffsetDateTime createdAt = rs.getObject("created_at", OffsetDateTime.class);
                audit.setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null);
                return audit;
            };

    private final JdbcTemplate jdbcTemplate;

    public BookingAuditRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<BookingAudit> findByBookingId(Long bookingId) {
        return jdbcTemplate.query(
                "SELECT id, booking_id, request_payload, price_breakdown, payment_response, status, error_message, created_at " +
                        "FROM booking_audit WHERE booking_id = ? ORDER BY id DESC",
                BOOKING_AUDIT_ROW_MAPPER,
                bookingId
        );
    }

    public BookingAudit save(BookingAudit audit) {
        if (audit.getId() == null) {
            Long id = jdbcTemplate.queryForObject(
                    "INSERT INTO booking_audit (booking_id, request_payload, price_breakdown, payment_response, status, error_message, created_at) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
                    Long.class,
                    audit.getBookingId(),
                    audit.getRequestPayload(),
                    audit.getPriceBreakdown(),
                    audit.getPaymentResponse(),
                    audit.getStatus(),
                    audit.getErrorMessage(),
                    toTimestamp(audit.getCreatedAt())
            );
            audit.setId(id);
            return audit;
        }

        jdbcTemplate.update(
                "UPDATE booking_audit SET booking_id = ?, request_payload = ?, price_breakdown = ?, payment_response = ?, status = ?, error_message = ? WHERE id = ?",
                audit.getBookingId(),
                audit.getRequestPayload(),
                audit.getPriceBreakdown(),
                audit.getPaymentResponse(),
                audit.getStatus(),
                audit.getErrorMessage(),
                audit.getId()
        );
        return audit;
    }

    private Timestamp toTimestamp(LocalDateTime value) {
        return value != null ? Timestamp.valueOf(value) : null;
    }
}

