-- PostgreSQL schema for Zoo Booking System (JDBC-native, no JPA/Hibernate)

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    mobile_number VARCHAR(50),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

CREATE TABLE IF NOT EXISTS slots (
    id BIGSERIAL PRIMARY KEY,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity >= 0),
    available_capacity INTEGER NOT NULL CHECK (available_capacity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_slots_window UNIQUE (slot_date, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_slots_date_active ON slots(slot_date, is_active);

CREATE TABLE IF NOT EXISTS add_on_master (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PER_BOOKING', 'PER_PERSON')),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    max_limit_per_booking INTEGER CHECK (max_limit_per_booking >= 0),
    available_capacity INTEGER CHECK (available_capacity >= 0),
    booked_capacity INTEGER NOT NULL DEFAULT 0 CHECK (booked_capacity >= 0),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    default_price NUMERIC(12, 2) NOT NULL CHECK (default_price >= 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS slot_pricing (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    ticket_type VARCHAR(20) NOT NULL CHECK (ticket_type IN ('ADULT', 'CHILD')),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_slot_pricing UNIQUE (slot_id, ticket_type)
);

CREATE INDEX IF NOT EXISTS idx_slot_pricing_slot ON slot_pricing(slot_id);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    slot_id BIGINT NOT NULL REFERENCES slots(id),
    adult_tickets INTEGER NOT NULL CHECK (adult_tickets >= 0),
    child_tickets INTEGER NOT NULL CHECK (child_tickets >= 0),
    add_on_camera INTEGER NOT NULL DEFAULT 0 CHECK (add_on_camera >= 0),
    add_on_safari INTEGER NOT NULL DEFAULT 0 CHECK (add_on_safari >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED', 'EXPIRED')),
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100),
    qr_code_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expiry_time TIMESTAMPTZ,
    guest_full_name VARCHAR(255),
    guest_email VARCHAR(255),
    guest_mobile_number VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created_at ON bookings(status, created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_expiry_pending ON bookings(status, expiry_time);

-- Normalized add-ons for extensibility/scalability
CREATE TABLE IF NOT EXISTS booking_add_ons (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    add_on_id BIGINT NOT NULL REFERENCES add_on_master(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_booking_add_on UNIQUE (booking_id, add_on_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_add_ons_booking_id ON booking_add_ons(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_add_ons_add_on_id ON booking_add_ons(add_on_id);

CREATE TABLE IF NOT EXISTS booking_audit (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    request_payload TEXT,
    price_breakdown TEXT,
    payment_response TEXT,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_audit_booking_id ON booking_audit(booking_id);

