package com.zoo.booking.auth.repository;

import com.zoo.booking.auth.entity.ERole;
import com.zoo.booking.auth.entity.Role;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class RoleRepository {
    private static final RowMapper<Role> ROLE_ROW_MAPPER =
            (rs, rowNum) -> {
                Role role = new Role();
                role.setId(rs.getLong("id"));
                role.setName(ERole.valueOf(rs.getString("name")));
                return role;
            };

    private final JdbcTemplate jdbcTemplate;

    public RoleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Role> findByName(ERole name) {
        List<Role> roles = jdbcTemplate.query(
                "SELECT id, name FROM roles WHERE name = ?",
                ROLE_ROW_MAPPER,
                name.name()
        );
        return roles.stream().findFirst();
    }
}

