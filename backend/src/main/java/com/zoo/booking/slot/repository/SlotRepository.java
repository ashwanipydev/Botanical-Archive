package com.zoo.booking.slot.repository;

import com.zoo.booking.slot.entity.Slot;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public class SlotRepository {
    private static final RowMapper<Slot> SLOT_ROW_MAPPER =
            (rs, rowNum) -> mapSlot(rs);

    private final JdbcTemplate jdbcTemplate;

    public SlotRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Slot> findById(Long id) {
        List<Slot> slots = jdbcTemplate.query(
                "SELECT id, slot_date, start_time, end_time, total_capacity, available_capacity, is_active " +
                        "FROM slots WHERE id = ?",
                SLOT_ROW_MAPPER,
                id
        );
        return slots.stream().findFirst();
    }

    public Optional<Slot> findByIdForUpdate(Long id) {
        List<Slot> slots = jdbcTemplate.query(
                "SELECT id, slot_date, start_time, end_time, total_capacity, available_capacity, is_active " +
                        "FROM slots WHERE id = ? FOR UPDATE",
                SLOT_ROW_MAPPER,
                id
        );
        return slots.stream().findFirst();
    }

    public List<Slot> findAll() {
        return jdbcTemplate.query(
                "SELECT id, slot_date, start_time, end_time, total_capacity, available_capacity, is_active " +
                        "FROM slots ORDER BY slot_date, start_time",
                SLOT_ROW_MAPPER
        );
    }

    public List<Slot> findBySlotDateAndIsActiveTrue(LocalDate date) {
        return jdbcTemplate.query(
                "SELECT id, slot_date, start_time, end_time, total_capacity, available_capacity, is_active " +
                        "FROM slots WHERE slot_date = ? AND is_active = TRUE ORDER BY start_time",
                SLOT_ROW_MAPPER,
                date
        );
    }

    public Slot save(Slot slot) {
        if (slot.getId() == null) {
            Long id = jdbcTemplate.queryForObject(
                    "INSERT INTO slots (slot_date, start_time, end_time, total_capacity, available_capacity, is_active) " +
                            "VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                    Long.class,
                    slot.getSlotDate(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    slot.getTotalCapacity(),
                    slot.getAvailableCapacity(),
                    Boolean.TRUE.equals(slot.getIsActive())
            );
            slot.setId(id);
            return slot;
        }

        jdbcTemplate.update(
                "UPDATE slots SET slot_date = ?, start_time = ?, end_time = ?, total_capacity = ?, available_capacity = ?, is_active = ?, updated_at = now() " +
                        "WHERE id = ?",
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getTotalCapacity(),
                slot.getAvailableCapacity(),
                Boolean.TRUE.equals(slot.getIsActive()),
                slot.getId()
        );
        return slot;
    }

    private static Slot mapSlot(ResultSet rs) throws java.sql.SQLException {
        Slot slot = new Slot();
        slot.setId(rs.getLong("id"));
        slot.setSlotDate(rs.getObject("slot_date", LocalDate.class));
        slot.setStartTime(rs.getObject("start_time", LocalTime.class));
        slot.setEndTime(rs.getObject("end_time", LocalTime.class));
        slot.setTotalCapacity((Integer) rs.getObject("total_capacity"));
        slot.setAvailableCapacity((Integer) rs.getObject("available_capacity"));
        slot.setIsActive((Boolean) rs.getObject("is_active"));
        return slot;
    }
}

