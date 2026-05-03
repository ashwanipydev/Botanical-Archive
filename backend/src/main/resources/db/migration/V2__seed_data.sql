-- Seed data for local/dev usage

-- Roles
INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;

-- Default admin user (email: sa@zoo.com, password: sa)
INSERT INTO users (full_name, email, password, mobile_number)
VALUES ('Admin User', 'sa@zoo.com', '$2b$10$zTVssUPtirpun6GQh2Z61OIx4Tw69ZnjIk.V5XjKYgyx5fI4xuRly', '1234567890')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE email = 'sa@zoo.com' LIMIT 1),
    (SELECT id FROM roles WHERE name = 'ROLE_ADMIN' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Test users (password hash is a common bcrypt example for "password")
INSERT INTO users (full_name, email, password, mobile_number)
VALUES ('Priya Sharma', 'priya@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91-9876543210')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE email = 'priya@email.com' LIMIT 1),
    (SELECT id FROM roles WHERE name = 'ROLE_USER' LIMIT 1)
) ON CONFLICT DO NOTHING;

INSERT INTO users (full_name, email, password, mobile_number)
VALUES ('Rahul Verma', 'rahul@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91-9876543211')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE email = 'rahul@email.com' LIMIT 1),
    (SELECT id FROM roles WHERE name = 'ROLE_USER' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Ticket types (not currently used by the backend logic, but ready for future pricing)
INSERT INTO ticket_types (name, default_price, is_active) VALUES ('ADULT', 800.00, TRUE) ON CONFLICT DO NOTHING;
INSERT INTO ticket_types (name, default_price, is_active) VALUES ('CHILD', 500.00, TRUE) ON CONFLICT DO NOTHING;

-- Slots
INSERT INTO slots (slot_date, start_time, end_time, total_capacity, available_capacity, is_active)
VALUES ('2026-04-16', '09:00:00', '11:00:00', 100, 22, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO slots (slot_date, start_time, end_time, total_capacity, available_capacity, is_active)
VALUES ('2026-04-17', '10:30:00', '12:00:00', 100, 50, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO slots (slot_date, start_time, end_time, total_capacity, available_capacity, is_active)
VALUES ('2026-04-17', '13:00:00', '14:30:00', 100, 75, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO slots (slot_date, start_time, end_time, total_capacity, available_capacity, is_active)
VALUES ('2026-04-18', '10:30:00', '12:00:00', 100, 100, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO slots (slot_date, start_time, end_time, total_capacity, available_capacity, is_active)
VALUES ('2026-04-18', '14:00:00', '16:00:00', 80, 15, TRUE)
ON CONFLICT DO NOTHING;

-- Add-ons
INSERT INTO add_on_master (name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active)
VALUES ('Camera', 'PER_BOOKING', 300.00, 1, 50, 0, 'Professional photography permit for botanical captures.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO add_on_master (name, type, price, max_limit_per_booking, available_capacity, booked_capacity, description, image_url, is_active)
VALUES ('Safari', 'PER_PERSON', 1000.00, 10, 30, 0, 'Guided wilderness expedition through the core jungle zones.', 'https://images.unsplash.com/photo-1549366021-9f761d450615', TRUE)
ON CONFLICT DO NOTHING;

-- Slot pricing (ADULT/CHILD) per slot window
INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'ADULT', 800.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-16' AND s.start_time='09:00:00' AND s.end_time='11:00:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'CHILD', 500.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-16' AND s.start_time='09:00:00' AND s.end_time='11:00:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'ADULT', 800.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-17' AND s.start_time='10:30:00' AND s.end_time='12:00:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'CHILD', 500.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-17' AND s.start_time='10:30:00' AND s.end_time='12:00:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'ADULT', 800.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-17' AND s.start_time='13:00:00' AND s.end_time='14:30:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'CHILD', 500.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-17' AND s.start_time='13:00:00' AND s.end_time='14:30:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'ADULT', 800.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-18' AND s.start_time='10:30:00' AND s.end_time='12:00:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'CHILD', 500.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-18' AND s.start_time='10:30:00' AND s.end_time='12:00:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'ADULT', 800.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-18' AND s.start_time='14:00:00' AND s.end_time='16:00:00'
ON CONFLICT DO NOTHING;

INSERT INTO slot_pricing (slot_id, ticket_type, price, is_active)
SELECT s.id, 'CHILD', 500.00, TRUE FROM slots s
WHERE s.slot_date='2026-04-18' AND s.start_time='14:00:00' AND s.end_time='16:00:00'
ON CONFLICT DO NOTHING;

-- Sample bookings
INSERT INTO bookings (adult_tickets, child_tickets, add_on_camera, add_on_safari, total_amount, status, created_at, user_id, slot_id)
VALUES (
    2, 1, 1, 2, 1230.00, 'CONFIRMED', '2026-04-10 10:00:00+05:30',
    (SELECT id FROM users WHERE email = 'priya@email.com' LIMIT 1),
    (SELECT id FROM slots WHERE slot_date='2026-04-16' AND start_time='09:00:00' AND end_time='11:00:00' LIMIT 1)
);

INSERT INTO bookings (adult_tickets, child_tickets, add_on_camera, add_on_safari, total_amount, status, created_at, user_id, slot_id, expiry_time)
VALUES (
    3, 0, 0, 0, 450.00, 'PENDING', '2026-04-11 11:30:00+05:30',
    (SELECT id FROM users WHERE email = 'rahul@email.com' LIMIT 1),
    (SELECT id FROM slots WHERE slot_date='2026-04-17' AND start_time='10:30:00' AND end_time='12:00:00' LIMIT 1),
    '2026-04-11 11:40:00+05:30'
);

-- Keep booking_add_ons in sync for the sample confirmed booking (booking id assumed to be 1 on a fresh DB)
INSERT INTO booking_add_ons (booking_id, add_on_id, quantity, unit_price)
SELECT b.id, a.id, 1, a.price
FROM bookings b
JOIN add_on_master a ON a.name = 'Camera'
WHERE b.status='CONFIRMED'
ORDER BY b.id
LIMIT 1;

INSERT INTO booking_add_ons (booking_id, add_on_id, quantity, unit_price)
SELECT b.id, a.id, 2, a.price
FROM bookings b
JOIN add_on_master a ON a.name = 'Safari'
WHERE b.status='CONFIRMED'
ORDER BY b.id
LIMIT 1;

