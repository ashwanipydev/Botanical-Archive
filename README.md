# 🌿 Botanical Archive — Zoo Booking & Management System

An editorial, production-grade Zoo Booking and Management System built with a "Bento Grid" aesthetic and a focus on premium UI/UX. The **Botanical Archive** streamlines the entire visitor journey, from dynamic slot selection to secure gate entry.

## ✨ Key Features

### 🎟️ Visitor Experience
- **Dynamic Booking Flow**: Intelligent calendar system with real-time slot availability.
- **Back-Date Security**: Enforced protection against historical date selection.
- **Secure Payments**: Seamless integration with Razorpay for automated transactions.
- **Automated E-Ticketing**: Instant PDF ticket generation and email delivery upon confirmation.

### 🛡️ Administrative Suite
- **Registry Dashboard**: High-level overview of revenue, occupancy, and visitor trends.
- **Slot Management**: Granular control over visit cycles, pricing overrides, and capacity limits.
- **User Management**: Role-based access control (RBAC) for Admins, Curators, and Gatekeepers.
- **Revenue Analytics**: Visual data tracking for ticket sales and demographic distribution.

### 🚪 Staff Operations
- **Gatekeeper Portal**: Mobile-responsive scanner for QR-based check-ins and check-outs.
- **Live Occupancy Tracking**: Real-time monitoring of active visitors within the sanctuary.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18
- **Styling**: Tailwind CSS (Custom "Botanical" Design System)
- **Icons**: Material Symbols (Variable Grade)
- **State Management**: React Context API
- **Animations**: Framer Motion & CSS Transitions

### Backend
- **Core**: Spring Boot 3.x (Java 17)
- **Security**: Spring Security with JWT
- **Database**: PostgreSQL 15
- **Migrations**: Flyway
- **Mailing**: Spring Boot Mail (Thymeleaf templates)
- **API**: RESTful architecture with OpenAPI/Swagger documentation

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Build Tools**: Maven & NPM

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Java 17+

### 1. Database Setup
Launch the PostgreSQL instance using Docker:
```bash
docker-compose up -d
```

### 2. Backend Initialization
```bash
cd backend
./mvnw spring-boot:run
```
*The API will be available at `http://localhost:8080`.*

### 3. Frontend Initialization
```bash
cd frontend
npm install
npm start
```
*The application will launch at `http://localhost:3000`.*

## 🎨 Design Philosophy: The No-Line Rule
The **Botanical Archive** follows a modern, editorial design language:
- **Tonal Depth**: Using surface colors instead of borders to define boundaries.
- **Micro-Animations**: Subtle feedback on interaction (hover, focus, toggle).
- **Frosted Glass**: Heavy use of `backdrop-blur` for modal and navigation depth.
- **Tactile Buttons**: 24px (1.5rem) corner radii for a friendly yet professional feel.

---
*Developed for the advanced management of botanical and zoological sanctuaries.*
