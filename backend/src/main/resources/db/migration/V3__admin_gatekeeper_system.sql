-- Migration V3: Admin and Gatekeeper System Support

-- 1. Add Check-In/Check-Out timestamps to Bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;

-- 2. Seed New Roles
INSERT INTO roles (name) VALUES ('ROLE_GATEKEEPER') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_STAFF') ON CONFLICT DO NOTHING;

-- 3. Add any necessary staff users or update existing ones (Optional but helpful for testing)
-- For now, we'll let the Admin create staff via the UI/API.

-- 4. Finalize constraints
-- Ensure checked_out_at is after checked_in_at if both present
ALTER TABLE bookings 
ADD CONSTRAINT chk_booking_times 
CHECK (checked_out_at IS NULL OR checked_in_at IS NULL OR checked_out_at >= checked_in_at);
