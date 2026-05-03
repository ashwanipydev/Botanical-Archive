package com.zoo.booking.pricing.repository;

import com.zoo.booking.pricing.entity.TicketType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class TicketTypeRepository {

    private final JdbcTemplate jdbcTemplate;

    public TicketTypeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<TicketType> findAll() {
        return jdbcTemplate.query("SELECT * FROM ticket_types WHERE is_active = TRUE", this::mapTicketType);
    }

    public Optional<TicketType> findByName(String name) {
        List<TicketType> results = jdbcTemplate.query(
                "SELECT * FROM ticket_types WHERE name = ? AND is_active = TRUE",
                this::mapTicketType,
                name
        );
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public TicketType save(TicketType ticketType) {
        if (ticketType.getId() == null) {
            jdbcTemplate.update(
                    "INSERT INTO ticket_types (name, default_price, description, is_active) VALUES (?, ?, ?, ?)",
                    ticketType.getName(),
                    ticketType.getDefaultPrice(),
                    ticketType.getDescription(),
                    ticketType.getIsActive() != null ? ticketType.getIsActive() : true
            );
            // Retrieve generated ID - in a real app use SimpleJdbcInsert or RETURNING id
            return findByName(ticketType.getName()).orElse(ticketType);
        } else {
            jdbcTemplate.update(
                    "UPDATE ticket_types SET name = ?, default_price = ?, description = ?, is_active = ? WHERE id = ?",
                    ticketType.getName(),
                    ticketType.getDefaultPrice(),
                    ticketType.getDescription(),
                    ticketType.getIsActive(),
                    ticketType.getId()
            );
            return ticketType;
        }
    }

    private TicketType mapTicketType(ResultSet rs, int rowNum) throws SQLException {
        TicketType tt = new TicketType();
        tt.setId(rs.getLong("id"));
        tt.setName(rs.getString("name"));
        tt.setDefaultPrice(rs.getDouble("default_price"));
        tt.setDescription(rs.getString("description"));
        tt.setIsActive(rs.getBoolean("is_active"));
        return tt;
    }
}
