package com.zoo.booking.auth.repository;

import com.zoo.booking.auth.entity.ERole;
import com.zoo.booking.auth.entity.Role;
import com.zoo.booking.auth.entity.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long count() {
        return jdbcTemplate.queryForObject("SELECT count(*) FROM users", Long.class);
    }

    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(queryUserWithRoles("u.email = ?", email));
    }

    public Optional<User> findByResetToken(String resetToken) {
        return Optional.ofNullable(queryUserWithRoles("u.reset_token = ?", resetToken));
    }

    public Boolean existsByEmail(String email) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)",
                Boolean.class,
                email
        );
        return Boolean.TRUE.equals(exists);
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(queryUserWithRoles("u.id = ?", id));
    }

    public Boolean existsById(Long id) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)",
                Boolean.class,
                id
        );
        return Boolean.TRUE.equals(exists);
    }

    public void deleteById(Long id) {
        // Delete roles first
        jdbcTemplate.update("DELETE FROM user_roles WHERE user_id = ?", id);
        // Delete user
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
    }

    public List<User> findAll() {
        String sql =
                "SELECT " +
                        "u.id AS u_id, u.full_name, u.email, u.password, u.mobile_number, u.reset_token, u.reset_token_expiry, u.is_active, " +
                        "r.id AS r_id, r.name AS r_name " +
                        "FROM users u " +
                        "LEFT JOIN user_roles ur ON ur.user_id = u.id " +
                        "LEFT JOIN roles r ON r.id = ur.role_id " +
                        "ORDER BY u.id";

        return jdbcTemplate.query(sql, (ResultSet rs) -> {
            java.util.Map<Long, User> userMap = new java.util.LinkedHashMap<>();
            while (rs.next()) {
                Long userId = rs.getLong("u_id");
                User user = userMap.computeIfAbsent(userId, id -> {
                    User u = new User();
                    u.setId(id);
                    try {
                        u.setFullName(rs.getString("full_name"));
                        u.setEmail(rs.getString("email"));
                        u.setPassword(rs.getString("password"));
                        u.setMobileNumber(rs.getString("mobile_number"));
                        u.setResetToken(rs.getString("reset_token"));
                        u.setIsActive(rs.getBoolean("is_active"));
                        OffsetDateTime resetTokenExpiry = rs.getObject("reset_token_expiry", OffsetDateTime.class);
                        u.setResetTokenExpiry(resetTokenExpiry != null ? resetTokenExpiry.toLocalDateTime() : null);
                        u.setRoles(new HashSet<>());
                    } catch (java.sql.SQLException e) {
                        throw new RuntimeException(e);
                    }
                    return u;
                });

                Long roleId = (Long) rs.getObject("r_id");
                if (roleId != null) {
                    Role role = new Role();
                    role.setId(roleId);
                    try {
                        role.setName(ERole.valueOf(rs.getString("r_name")));
                    } catch (java.sql.SQLException e) {
                        throw new RuntimeException(e);
                    }
                    user.getRoles().add(role);
                }
            }
            return new java.util.ArrayList<>(userMap.values());
        });
    }

    public User save(User user) {
        if (user.getId() == null) {
            Long id = jdbcTemplate.queryForObject(
                    "INSERT INTO users (full_name, email, password, mobile_number, reset_token, reset_token_expiry) " +
                            "VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                    Long.class,
                    user.getFullName(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getMobileNumber(),
                    user.getResetToken(),
                    toTimestamp(user.getResetTokenExpiry())
            );
            user.setId(id);
            insertUserRoles(id, user.getRoles());
            return user;
        }

        jdbcTemplate.update(
                "UPDATE users SET full_name = ?, email = ?, password = ?, mobile_number = ?, reset_token = ?, reset_token_expiry = ?, updated_at = now() " +
                        "WHERE id = ?",
                user.getFullName(),
                user.getEmail(),
                user.getPassword(),
                user.getMobileNumber(),
                user.getResetToken(),
                toTimestamp(user.getResetTokenExpiry()),
                user.getId()
        );

        // Synchronize roles: Delete old, Insert new
        jdbcTemplate.update("DELETE FROM user_roles WHERE user_id = ?", user.getId());
        insertUserRoles(user.getId(), user.getRoles());
        
        return user;


    }

    private User queryUserWithRoles(String whereClause, Object param) {
        String sql =
                "SELECT " +
                        "u.id AS u_id, u.full_name, u.email, u.password, u.mobile_number, u.reset_token, u.reset_token_expiry, " +
                        "r.id AS r_id, r.name AS r_name " +
                        "FROM users u " +
                        "LEFT JOIN user_roles ur ON ur.user_id = u.id " +
                        "LEFT JOIN roles r ON r.id = ur.role_id " +
                        "WHERE " + whereClause;

        return jdbcTemplate.query(sql, ps -> ps.setObject(1, param), (ResultSetExtractor<User>) this::extractSingleUserWithRoles);
    }

    private User extractSingleUserWithRoles(ResultSet rs) throws java.sql.SQLException {
        User user = null;
        Set<Role> roles = new HashSet<>();

        while (rs.next()) {
            if (user == null) {
                user = new User();
                user.setId(rs.getLong("u_id"));
                user.setFullName(rs.getString("full_name"));
                user.setEmail(rs.getString("email"));
                user.setPassword(rs.getString("password"));
                user.setMobileNumber(rs.getString("mobile_number"));
                user.setResetToken(rs.getString("reset_token"));

                OffsetDateTime resetTokenExpiry = rs.getObject("reset_token_expiry", OffsetDateTime.class);
                user.setResetTokenExpiry(resetTokenExpiry != null ? resetTokenExpiry.toLocalDateTime() : null);
            }

            Long roleId = (Long) rs.getObject("r_id");
            if (roleId != null) {
                Role role = new Role();
                role.setId(roleId);
                role.setName(ERole.valueOf(rs.getString("r_name")));
                roles.add(role);
            }
        }

        if (user == null) {
            return null;
        }

        user.setRoles(roles);
        return user;
    }


    private void insertUserRoles(Long userId, Set<Role> roles) {
        if (userId == null || roles == null || roles.isEmpty()) {
            return;
        }
        for (Role role : roles) {
            if (role == null) {
                continue;
            }
            Long roleId = role.getId();
            if (roleId == null) {
                continue;
            }
            jdbcTemplate.update(
                    "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                    userId,
                    roleId
            );
        }
    }

    private Timestamp toTimestamp(LocalDateTime value) {
        return value != null ? Timestamp.valueOf(value) : null;
    }
}
