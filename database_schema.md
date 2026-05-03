# Zoo Booking System Database Schema

This document outlines the complete PostgreSQL database schema for the Civic Naturalist Zoo application.

## 1. Authentication & User Management

### `users`
Stores all account information for customers, staff, and administrators.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| [id](file:///home/ashwani/Desktop/zoo/frontend/src/components/AdminSidebar.js#14-104) | BIGSERIAL | PRIMARY KEY | Unique user identifier. |
| `full_name` | VARCHAR(255) | | Full name of the user. |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Primary login identifier. |
| [password](file:///home/ashwani/Desktop/zoo/backend/src/main/java/com/zoo/booking/security/WebSecurityConfig.java#59-63) | VARCHAR(255) | | Bcrypt hashed password. |
| `mobile_number`| VARCHAR(50) | | Contact number. |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account activation status. |
| `reset_token` | VARCHAR(255) | | Token for password resets. |
| `reset_token_expiry`| TIMESTAMPTZ | | Expiry for reset token. |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Registration timestamp. |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last profile update. |

### `roles`
Defines system and functional roles.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| [id](file:///home/ashwani/Desktop/zoo/frontend/src/components/AdminSidebar.js#14-104) | BIGSERIAL | PRIMARY KEY | Role identifier. |
| `name` | VARCHAR(20) | NOT NULL, UNIQUE | e.g., ROLE_ADMIN, ROLE_GATEKEEPER. |

### `user_roles`
Many-to-Many mapping between users and roles.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | REFERENCES users(id) | |
| `role_id` | BIGINT | REFERENCES roles(id) | |

---

## 2. Resource Management

### `slots`
Inventory of available booking windows.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| [id](file:///home/ashwani/Desktop/zoo/frontend/src/components/AdminSidebar.js#14-104) | BIGSERIAL | PRIMARY KEY | |
| `slot_date` | DATE | NOT NULL | Date of the tour/visit. |
| `start_time` | TIME | NOT NULL | Window start. |
| `end_time` | TIME | NOT NULL | Window end. |
| `total_capacity`| INTEGER | >= 0 | Total seats available. |
| `available_capacity`| INTEGER | >= 0 | Remaining seats. |
| `is_active` | BOOLEAN | DEFAULT TRUE | |

### `slot_pricing`
Dynamic pricing for specific slots.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| [id](file:///home/ashwani/Desktop/zoo/frontend/src/components/AdminSidebar.js#14-104) | BIGSERIAL | PRIMARY KEY | |
| `slot_id` | BIGINT | REFERENCES slots(id) | |
| `ticket_type` | VARCHAR(20) | ADULT / CHILD | |
| `price` | NUMERIC(12,2) | >= 0 | |

---

## 3. Booking Engine

### `bookings`
Core transaction table.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| [id](file:///home/ashwani/Desktop/zoo/frontend/src/components/AdminSidebar.js#14-104) | BIGSERIAL | PRIMARY KEY | |
| `user_id` | BIGINT | REFERENCES users(id) | Owning user. |
| `slot_id` | BIGINT | REFERENCES slots(id) | Target window. |
| `adult_tickets` | INTEGER | | Count of adult tickets. |
| `child_tickets` | INTEGER | | Count of child tickets. |
| `total_amount` | NUMERIC(12,2) | | Total price paid. |
| `status` | VARCHAR(20) | PENDING/CONFIRMED/FAILED/EXPIRED | |
| `checked_in_at` | TIMESTAMPTZ | | Timestamp of entry (Gatekeeper).|
| `checked_out_at`| TIMESTAMPTZ | | Timestamp of exit (Gatekeeper). |
| `qr_code_url` | TEXT | | Link to generated QR code. |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### `booking_add_ons`
Line items for add-on purchases (Camera, Safari, etc).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| [id](file:///home/ashwani/Desktop/zoo/frontend/src/components/AdminSidebar.js#14-104) | BIGSERIAL | PRIMARY KEY | |
| `booking_id` | BIGINT | REFERENCES bookings(id) | |
| `add_on_id` | BIGINT | REFERENCES add_on_master(id) | |
| `quantity` | INTEGER | | |
| `unit_price` | NUMERIC(12,2) | | Price locked at booking time. |

---

## 4. Master Data

### `add_on_master`
Inventory of available services.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| [id](file:///home/ashwani/Desktop/zoo/frontend/src/components/AdminSidebar.js#14-104) | BIGSERIAL | PRIMARY KEY | |
| `name` | VARCHAR(100) | UNIQUE | |
| `type` | VARCHAR(20) | PER_BOOKING / PER_PERSON | |
| `price` | NUMERIC(12,2) | | |
| `description` | TEXT | | Botanical or service details. |
| `image_url` | TEXT | | Visual reference link. |
| `is_active` | BOOLEAN | | |

---

## 5. System Logs

### `booking_audit`
Financial and protocol audit logs.
| Column | Type | Description |
| :--- | :--- | :--- |
| `booking_id` | BIGINT | |
| `status` | VARCHAR(50) | State change or result. |
| `error_message` | TEXT | Details if failed. |
| `created_at` | TIMESTAMPTZ | |
