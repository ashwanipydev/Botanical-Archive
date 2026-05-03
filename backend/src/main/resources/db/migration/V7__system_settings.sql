-- System settings for dynamic pricing configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial values
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('dynamic_pricing_enabled', 'true', 'Enable/Disable automatic surges based on occupancy'),
('manual_overrides_enabled', 'true', 'Enable/Disable slot-specific manual price overrides'),
('surge_threshold_percent', '90', 'Occupancy percentage threshold to trigger automatic price surge'),
('surge_multiplier', '1.5', 'Price multiplier applied when surge is triggered')
ON CONFLICT (setting_key) DO NOTHING;
