# Eventia Platform

<p align="center">
  <strong>Enterprise Event Management Platform</strong><br />
  A full-stack software solution for managing events, venues, bookings, approvals, payments, feedback, real-time communication, and analytics.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MariaDB-blue" />
  <img src="https://img.shields.io/badge/Auth-JWT-green" />
  <img src="https://img.shields.io/badge/Payments-Stripe-blueviolet" />
  <img src="https://img.shields.io/badge/Realtime-Socket.io-black" />
  <img src="https://img.shields.io/badge/AI-GROQ-orange" />
  <img src="https://img.shields.io/badge/License-Portfolio-lightgrey" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Objectives](#key-objectives)
- [User Roles](#user-roles)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Security](#security)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [API Modules](#api-modules)
- [Enterprise Qualities](#enterprise-qualities)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [License](#license)

---

## Overview

**Eventia** is an enterprise-level event management platform designed to connect event organizers, venue managers, attendees, and administrators in one centralized system. The platform supports the complete event lifecycle — from user registration and role-based access control, through event creation, venue availability management, booking requests, and ticket reservations, to online payments, feedback collection, AI-powered assistance, and administrative monitoring.

The system is built with a modern full-stack architecture using **React**, **Node.js**, **Express.js**, and **MariaDB**, with support for JWT authentication, file uploads, real-time chat via Socket.io, Stripe payment integration, and AI-based features powered by the GROQ API.

---

## Key Objectives

- Provide a professional digital platform for event creation and venue booking.
- Support multiple user roles with secure, granular role-based access control.
- Allow attendees to browse, book, pay for, and review events seamlessly.
- Enable event organizers to manage events, tickets, analytics, and communications.
- Allow venue managers to manage venues, availability, and booking requests.
- Give administrators full control over approvals, platform settings, and user management.
- Improve decision-making using dashboards, analytics, AI summaries, and sentiment analysis.

---

## User Roles

### Administrator

Responsible for supervising and governing the entire platform.

| Responsibility | Description |
|---|---|
| User Management | Manage all platform users across roles |
| Account Approvals | Approve or reject Event Organizer and Venue Manager accounts |
| Platform Settings | Configure event types, ticket types, and global settings |
| Monitoring | Access dashboards, analytics, and system activity reports |
| Support | Manage contact and support requests |
| Security | Maintain overall platform integrity |

---

### Event Organizer

Responsible for creating and managing events end-to-end.

| Responsibility | Description |
|---|---|
| Event Management | Create, edit, and manage events |
| Ticketing | Configure event ticket types and capacities |
| Venue Booking | Send booking requests to venue managers |
| Analytics | Track revenue, ticket sales, and event performance |
| Communication | Send announcements and chat with venue managers in real time |
| AI Tools | Use sentiment analysis on feedback and AI chatbot assistance |
| Attendance | Manage QR code-based attendance tracking |

---

### Venue Manager

Responsible for managing venue profiles and coordinating bookings.

| Responsibility | Description |
|---|---|
| Venue Profiles | Create and manage venue listings |
| Availability | Manage and validate availability slots |
| Booking Requests | Approve or reject incoming booking requests |
| Statistics | Monitor venue usage and performance metrics |
| Communication | Chat with event organizers in real time |
| Support | Submit contact requests to administrators |

---

### Attendee

The end user who browses, books, and reviews events.

| Responsibility | Description |
|---|---|
| Event Discovery | Browse and view available events |
| Booking | Reserve tickets and complete secure payments |
| Confirmation | Receive booking confirmation emails and QR codes |
| History | Manage and review booking history |
| Feedback | Submit ratings and reviews after attending events |
| AI Assistance | Use the AI chatbot for platform support |

---

## Core Features

### Authentication & Authorization

- Secure signup and login system
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Protected frontend routes
- Password hashing with bcrypt
- Soft delete support for user accounts

### Admin Management

- Pending approval workflow for organizers and venue managers
- Full user management across all roles
- Platform settings configuration
- Contact and support request handling
- Administrative monitoring dashboard

### Event Management

- Full event creation and editing lifecycle
- Event image upload support
- Event type selection and configuration
- Ticket type and capacity management
- Event status tracking
- Organizer-specific event dashboard

### Venue Management

- Venue profile creation with image and document support
- Availability slot management with conflict validation
- Venue booking request handling and approval workflow
- Venue manager performance dashboard

### Booking & Ticketing

- End-to-end event booking flow for attendees
- Ticket quantity management per event
- Full booking history with cancellation support
- Email confirmation notifications
- QR code ticket generation for attendance verification

### Payment Integration

- Stripe Sandbox integration
- Secure payment checkout workflow
- Webhook support for real-time payment status updates
- Tamper-proof payment confirmation handling

### Real-Time Messaging

- Organizer-to-venue-manager chat system
- Conversation and message history management
- Unread message tracking
- Real-time delivery via Socket.io

### Feedback & AI Analysis

- Attendee event ratings and reviews
- Per-event feedback dashboard for organizers
- AI-powered feedback summarization
- Sentiment analysis on attendee responses
- AI chatbot assistance across all user roles

### Analytics & Dashboards

- Role-specific dashboards per user type
- Revenue and ticket sales tracking
- Booking and venue usage statistics
- Platform-level monitoring for administrators

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js + TypeScript | UI framework and type safety |
| Vite | Build tooling and dev server |
| Material UI | Component library |
| Lucide React | Icon set |
| Axios | HTTP client |
| CSS | Custom styling |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server runtime and REST API framework |
| JWT | Stateless authentication |
| Express Validator | Server-side input validation |
| Multer | File upload handling |
| Nodemailer | Email notifications |
| Socket.io | Real-time bidirectional communication |

### Database

| Technology | Purpose |
|---|---|
| MariaDB | Relational database engine |
| Raw SQL | Query execution with indexing and optimization |

### AI & External Services

| Service | Purpose |
|---|---|
| GROQ AI API | AI chatbot and sentiment analysis |
| Stripe Sandbox | Payment processing |
| Nodemailer | Transactional email delivery |
| QR Code Library | Ticket QR code generation |

---

## System Architecture

Eventia follows a clean, layered full-stack architecture designed for scalability and maintainability.

```
┌─────────────────────────────────────────┐
│            Client Layer                 │
│       React + TypeScript + CSS          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│              API Layer                  │
│      Node.js + Express.js REST APIs     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Business Logic Layer            │
│    Controllers + Services + Repos       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Database Layer                │
│               MariaDB                   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         External Services               │
│   Stripe · Email · GROQ AI · Socket.io  │
└─────────────────────────────────────────┘
```

### Backend Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `routes` | Define API endpoints and apply middleware |
| `controllers` | Handle request/response logic |
| `services` | Apply business rules and validation |
| `repositories` | Execute SQL queries and database operations |
| `utils` | Shared helpers, error handlers, tokens, upload config |

---

## Database Design

The database is designed using relational principles with full support for role-based access control and normalized data structures.

**Core Entities:**

| Domain | Tables |
|---|---|
| Identity & Access | Users, Roles, Permissions, Role Permissions |
| People | Event Organizers, Venue Managers, Attendees |
| Events | Events, Event Types, Ticket Types, Event Tickets |
| Venues | Venues, Venue Availability, Venue Booking Requests |
| Transactions | Bookings, Booking Tickets, Payments |
| Communication | Conversations, Messages, Contact Requests |
| Feedback | Feedback |

---

## Security

| Measure | Implementation |
|---|---|
| Authentication | JWT tokens on all protected routes |
| Authorization | Role-based access control per endpoint |
| Password Security | bcrypt hashing |
| Input Validation | Server-side validation via Express Validator |
| File Uploads | Type and size filtering via Multer |
| Data Integrity | Soft delete strategy for user accounts |
| Payments | Secure Stripe webhook signature verification |
| Dashboard Access | Role-scoped views with enforced access control |

---

## Installation & Setup

### Prerequisites

Ensure the following are installed on your system before proceeding:

- [Node.js](https://nodejs.org/)
- npm
- [MariaDB](https://mariadb.org/)
- Git
- [Stripe CLI](https://stripe.com/docs/stripe-cli) *(required only for local webhook testing)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/odayaridi/Eventia-Project.git
cd Eventia-Project
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3010
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eventia_db
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:

```bash
npm run start:dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3010/api
```

Start the frontend development server:

```bash
npm run dev
```

---

### 4. Stripe Webhook Testing (Local)

To test Stripe payment webhooks locally, run the following in a separate terminal and keep it open during payment testing:

```bash
stripe login
stripe listen --forward-to localhost:3010/api/payment/webhook
```

---

## Project Structure

```
Eventia-Project/
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API service modules
│   │   ├── assets/           # Static assets
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Page-level components
│   │   ├── routes/           # Protected and public route definitions
│   │   └── styles/           # Global and component styles
│   └── package.json
│
├── backend/
│   ├── controllers/          # Request/response handlers
│   ├── routes/               # Express route definitions
│   ├── services/             # Business logic layer
│   ├── repositories/         # Database query layer
│   ├── middlewares/          # Auth, validation, and upload middleware
│   ├── utils/                # Shared utilities and helpers
│   ├── public/               # Static file serving
│   └── package.json
│
├── database/
│   └── schema.sql            # Full database schema
│
└── README.md
```

---

## API Modules

| Module | Description |
|---|---|
| Authentication API | Signup, login, token management |
| Admin API | User approvals, settings, monitoring |
| Event API | Event CRUD, ticket configuration |
| Venue API | Venue profiles, availability, booking requests |
| Booking API | Ticket reservations and booking management |
| Payment API | Stripe checkout and webhook handling |
| Feedback API | Ratings, reviews, and AI sentiment analysis |
| Messaging API | Real-time conversations and message history |
| Profile API | User profile management |
| AI API | Chatbot assistance and feedback summarization |
| Contact Request API | Admin support request handling |

---

## Enterprise Qualities

Eventia is engineered to reflect professional software development standards across the full stack.

| Quality | Implementation |
|---|---|
| Modular Architecture | Clean separation of concerns across all layers |
| Scalable Backend | Layered structure designed for growth |
| Reusable Services | Shared API services and utility modules |
| Secure by Design | Auth, RBAC, validation, and encrypted credentials |
| Database Normalization | Fully normalized relational schema |
| Error Handling | Consistent error response strategy across the API |
| Real-Time Support | Socket.io-based messaging infrastructure |
| External Integrations | Stripe, GROQ AI, Nodemailer, QR Code services |
| Maintainable Codebase | Consistent conventions and folder organization |
| Professional Dashboards | Role-specific analytics and monitoring interfaces |

---

## Future Enhancements

| Enhancement | Description |
|---|---|
| Advanced Reporting | Extended analytics and export capabilities |
| Admin Audit Logs | Full audit trail for administrative actions |
| Notification Center | In-app notification system |
| Mobile Application | Native iOS and Android versions |
| Recommendation Engine | AI-powered event and venue recommendations |
| Multi-Language Support | Internationalization (i18n) across the platform |
| Advanced Search | Venue and event filtering with geo-location support |
| Docker Deployment | Containerized deployment configuration |
| CI/CD Pipeline | Automated testing and deployment workflows |

---

## Author

**Oday Aridi**  
Computer Science Graduate — University of Balamand

GitHub: [@odayaridi](https://github.com/odayaridi)

---

## License

This project is intended for academic and professional portfolio purposes. Licensing terms can be updated based on future deployment or organizational requirements.

---

<p align="center">
  <strong>Eventia Platform</strong><br />
  Smart. Scalable. Professional Event Management Software.
</p>
