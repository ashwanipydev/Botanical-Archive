package com.zoo.booking.system.repository;

import com.zoo.booking.system.entity.SystemSetting;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SystemSettingRepository {
    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<SystemSetting> ROW_MAPPER = (rs, rowNum) -> {
        SystemSetting setting = new SystemSetting();
        setting.setId(rs.getLong("id"));
        setting.setSettingKey(rs.getString("setting_key"));
        setting.setSettingValue(rs.getString("setting_value"));
        setting.setDescription(rs.getString("description"));
        return setting;
    };

    public SystemSettingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<SystemSetting> findAll() {
        return jdbcTemplate.query("SELECT * FROM system_settings", ROW_MAPPER);
    }

    public Optional<SystemSetting> findByKey(String key) {
        return jdbcTemplate.query("SELECT * FROM system_settings WHERE setting_key = ?", ROW_MAPPER, key)
                .stream().findFirst();
    }

    public String getValue(String key, String defaultValue) {
        return findByKey(key).map(SystemSetting::getSettingValue).orElse(defaultValue);
    }

    public boolean getBooleanValue(String key, boolean defaultValue) {
        return Boolean.parseBoolean(getValue(key, String.valueOf(defaultValue)));
    }

    public int getIntValue(String key, int defaultValue) {
        try {
            return Integer.parseInt(getValue(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public double getDoubleValue(String key, double defaultValue) {
        try {
            return Double.parseDouble(getValue(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public void updateValue(String key, String value) {
        jdbcTemplate.update("UPDATE system_settings SET setting_value = ?, updated_at = now() WHERE setting_key = ?", value, key);
    }
}
