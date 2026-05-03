package com.zoo.booking.addons.repository;

import com.zoo.booking.addons.entity.AddOn;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class AddOnRepository {
    private static final RowMapper<AddOn> ADD_ON_ROW_MAPPER =
            (rs, rowNum) -> {
                AddOn addOn = new AddOn();
                addOn.setId(rs.getLong("id"));
                addOn.setName(rs.getString("name"));
                addOn.setType(rs.getString("type"));
                java.math.BigDecimal priceDecimal = rs.getBigDecimal("price");
                addOn.setPrice(priceDecimal != null ? priceDecimal.doubleValue() : 0.0);
                addOn.setMaxLimitPerBooking((Integer) rs.getObject("max_limit_per_booking"));
                addOn.setAvailableCapacity((Integer) rs.getObject("available_capacity"));
                addOn.setBookedCapacity((Integer) rs.getObject("booked_capacity"));
                addOn.setDescription(rs.getString("description"));
                addOn.setImageUrl(rs.getString("image_url"));
                addOn.setIsActive((Boolean) rs.getObject("is_active"));
                return addOn;
            };

    private final JdbcTemplate jdbcTemplate;

    public AddOnRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<AddOn> findById(Long id) {
        List<AddOn> addOns = jdbcTemplate.query(
                "SELECT id, name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active " +
                        "FROM add_on_master WHERE id = ?",
                ADD_ON_ROW_MAPPER,
                id
        );
        return addOns.stream().findFirst();
    }

    public Optional<AddOn> findByIdForUpdate(Long id) {
        List<AddOn> addOns = jdbcTemplate.query(
                "SELECT id, name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active " +
                        "FROM add_on_master WHERE id = ? FOR UPDATE",
                ADD_ON_ROW_MAPPER,
                id
        );
        return addOns.stream().findFirst();
    }

    public Optional<AddOn> findByName(String name) {
        List<AddOn> addOns = jdbcTemplate.query(
                "SELECT id, name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active " +
                        "FROM add_on_master WHERE name = ?",
                ADD_ON_ROW_MAPPER,
                name
        );
        return addOns.stream().findFirst();
    }

    public AddOn save(AddOn addOn) {
        if (addOn.getId() == null) {
            Long id = jdbcTemplate.queryForObject(
                    "INSERT INTO add_on_master (name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                    Long.class,
                    addOn.getName(),
                    addOn.getType(),
                    addOn.getPrice(),
                    addOn.getMaxLimitPerBooking(),
                    addOn.getAvailableCapacity(),
                    addOn.getBookedCapacity(),
                    addOn.getDescription(),
                    addOn.getImageUrl(),
                    Boolean.TRUE.equals(addOn.getIsActive())
            );
            addOn.setId(id);
            return addOn;
        }

        jdbcTemplate.update(
                "UPDATE add_on_master SET name = ?, type = ?, price = ?, max_limit_per_booking = ?, available_capacity = ?, booked_capacity = ?, description = ?, image_url = ?, is_active = ?, updated_at = now() " +
                        "WHERE id = ?",
                addOn.getName(),
                addOn.getType(),
                addOn.getPrice(),
                addOn.getMaxLimitPerBooking(),
                addOn.getAvailableCapacity(),
                addOn.getBookedCapacity(),
                addOn.getDescription(),
                addOn.getImageUrl(),
                Boolean.TRUE.equals(addOn.getIsActive()),
                addOn.getId()
        );
        return addOn;
    }

    public List<AddOn> findAll() {
        return jdbcTemplate.query(
                "SELECT id, name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active FROM add_on_master ORDER BY id",
                ADD_ON_ROW_MAPPER
        );
    }

    public List<AddOn> findByIsActiveTrue() {
        return jdbcTemplate.query(
                "SELECT id, name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active " +
                        "FROM add_on_master WHERE is_active = true ORDER BY name",
                ADD_ON_ROW_MAPPER
        );
    }

    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM add_on_master WHERE id = ?", id);
    }
}

