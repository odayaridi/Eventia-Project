# Eventia Platform

<p align="center">
  <strong>Enterprise Event Management Platform</strong><br />
  A full-stack software solution for managing events, venues, bookings, approvals, payments, feedback, real-time communication, and analytics.
</p>

---

## Overview

**Eventia** is an enterprise-level event management platform designed to connect event organizers, venue managers, attendees, and administrators in one centralized system. The platform supports the complete event lifecycle: user registration, role-based access control, event creation, venue availability management, booking requests, ticket reservations, online payments, feedback collection, AI-powered assistance, and administrative monitoring.

The system is built with a modern full-stack architecture using **React**, **Node.js**, **Express.js**, and **MariaDB**, with support for authentication, authorization, file uploads, real-time chat, payment integration, and AI-based features.

---

## Key Objectives

- Provide a professional digital platform for event creation and venue booking.
- Support multiple user roles with secure role-based access control.
- Allow attendees to browse, book, pay for, and review events.
- Enable event organizers to manage events, tickets, analytics, and communication.
- Allow venue managers to manage venues, availability, and booking requests.
- Give administrators full control over approvals, platform settings, and user management.
- Improve decision-making using dashboards, analytics, AI summaries, and sentiment analysis.

---

## User Roles

### Admin

The administrator is responsible for managing and supervising the entire platform.

Main responsibilities:

- Manage platform users.
- Approve or reject Event Organizer accounts.
- Approve or reject Venue Manager accounts.
- Manage platform settings such as event types and ticket types.
- Monitor system activity through dashboards and analytics.
- Manage contact and support requests.
- Maintain overall platform integrity and security.

### Event Organizer

The Event Organizer is responsible for creating and managing events.

Main responsibilities:

- Create and manage events.
- Configure event ticket types.
- Send booking requests to venue managers.
- Track revenue, tickets sold, and event performance.
- Send announcements to attendees.
- Communicate with venue managers through real-time chat.
- View attendee feedback.
- Analyze feedback using AI sentiment analysis.
- Use an AI chatbot for assistance.
- Manage QR code-based attendance tracking.

### Venue Manager

The Venue Manager is responsible for managing venue profiles and availability.

Main responsibilities:

- Create and manage venue profiles.
- Manage venue availability slots.
- Approve or reject venue booking requests.
- View scheduled events.
- Monitor venue statistics.
- Communicate with event organizers through real-time chat.
- Send contact requests to admin.
- Use an AI chatbot for support.

### Attendee

The Attendee is the end user who browses and books events.

Main responsibilities:

- Browse available events.
- View event details.
- Book tickets.
- Complete payments.
- Receive booking confirmation and QR code.
- Manage booking history.
- Delete accidental bookings when allowed.
- Submit ratings and feedback after attending events.
- Use an AI chatbot for assistance.

---

## Core Features

### Authentication and Authorization

- Secure signup and login system.
- JWT-based authentication.
- Role-based access control.
- Protected frontend routes.
- Password hashing.
- Soft delete support for users.

### Admin Management

- Pending approval system for Event Organizers and Venue Managers.
- User management for attendees, organizers, and venue managers.
- Platform settings management.
- Contact/support request handling.
- Dashboard monitoring.

### Event Management

- Event creation and editing.
- Event image upload support.
- Event type selection.
- Ticket type configuration.
- Event status tracking.
- Event capacity management.
- Organizer event dashboard.

### Venue Management

- Venue profile creation.
- Venue image/document support.
- Venue availability management.
- Availability conflict validation.
- Venue booking request handling.
- Venue manager dashboard.

### Booking and Ticketing

- Event booking flow for attendees.
- Ticket quantity management.
- Booking history.
- Booking cancellation/deletion support.
- Email confirmation notifications.
- QR code ticket generation for attendance verification.

### Payment Integration

- Stripe Sandbox integration.
- Payment checkout workflow.
- Webhook support for payment status updates.
- Secure payment confirmation handling.

### Real-Time Messaging

- Organizer-to-venue-manager chat system.
- Conversation management.
- Message history.
- Unread message tracking.
- Real-time communication support using Socket.io.

### Feedback and AI Analysis

- Attendees can rate and review events.
- Organizers can view feedback per event.
- AI-based feedback summarization.
- Sentiment analysis support.
- AI chatbot assistance for users.

### Analytics and Dashboard

- Role-specific dashboards.
- Revenue tracking.
- Ticket sales tracking.
- Booking statistics.
- Venue usage statistics.
- Platform-level monitoring for administrators.

---

## Technology Stack

### Frontend

- React.js
- TypeScript
- Vite
- CSS
- Material UI
- Lucide React Icons
- Axios

### Backend

- Node.js
- Express.js
- REST API Architecture
- JWT Authentication
- Express Validator
- Multer File Uploads
- Nodemailer
- Socket.io

### Database

- MariaDB
- Relational database design
- Raw SQL queries
- Indexing and performance optimization support

### AI and External Services

- GROQ AI API
- Stripe Sandbox
- Email service using Nodemailer
- QR Code generation

---

## System Architecture

Eventia follows a layered full-stack architecture.

```text
Client Layer
React + TypeScript + CSS
        |
        v
API Layer
Node.js + Express.js REST APIs
        |
        v
Business Logic Layer
Controllers + Services + Repositories
        |
        v
Database Layer
MariaDB
        |
        v
External Services
Stripe, Email, AI API, Socket.io
```

### Backend Layered Structure

The backend follows a clean separation of responsibilities:

```text
routes       -> Define API endpoints
controllers  -> Handle request and response logic
services     -> Apply business rules and validation logic
repositories -> Execute SQL queries and database operations
utils        -> Shared helpers, errors, tokens, upload config, etc.
```

---

## Database Design

The database is designed using relational principles and supports role-based access control.

Main database areas include:

- Users
- Roles
- Permissions
- Role Permissions
- Event Organizers
- Venue Managers
- Attendees
- Events
- Event Types
- Ticket Types
- Event Tickets
- Venues
- Venue Availability
- Venue Booking Requests
- Bookings
- Booking Tickets
- Payments
- Feedback
- Conversations
- Messages
- Contact Requests

---

## Security Features

- JWT authentication.
- Protected API routes.
- Role-based authorization.
- Password hashing using bcrypt.
- Server-side input validation.
- File upload filtering.
- Soft delete strategy for users.
- Secure payment webhook handling.
- Controlled access to dashboards based on user role.

---

## Installation and Setup

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- MariaDB
- Git
- Stripe CLI, if testing payment webhooks locally

---

## Clone the Repository

```bash
git clone https://github.com/odayaridi/Eventia-Project.git
cd Eventia-Project
```

---

## Backend Setup

Navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file:

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

Run the backend server:

```bash
npm run dev
```

---

## Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env` file if needed:

```env
VITE_API_BASE_URL=http://localhost:3010/api
```

Run the frontend:

```bash
npm run dev
```

---

## Stripe Webhook Testing

To test Stripe webhooks locally:

```bash
stripe login
stripe listen --forward-to localhost:3010/api/payment/webhook
```

Keep the terminal open while testing payments.

---

## Recommended Project Structure

```text
Eventia-Project/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/
│   ├── utils/
│   ├── public/
│   └── package.json
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## API Highlights

Example API modules:

- Authentication API
- Admin API
- Event API
- Venue API
- Booking API
- Payment API
- Feedback API
- Messaging API
- Profile API
- AI API
- Contact Request API

---

## Enterprise Software Qualities

Eventia is designed to reflect professional software engineering practices:

- Modular architecture.
- Scalable backend structure.
- Clean separation between frontend and backend.
- Reusable API services.
- Secure authentication and role access.
- Database normalization.
- Error handling strategy.
- Professional dashboard interfaces.
- Real-time communication support.
- External service integration.
- Maintainable code organization.

---

## Future Enhancements

Possible future improvements include:

- Advanced reporting dashboard.
- Admin audit logs.
- Notification center.
- Mobile application version.
- Advanced recommendation system.
- Multi-language support.
- Advanced venue search and filtering.
- Deployment using Docker.
- CI/CD pipeline integration.

---

## Author

**Oday Aridi**  
Computer Science Graduate  
University of Balamand

GitHub: [@odayaridi](https://github.com/odayaridi)

---

## License

This project is intended for academic and professional portfolio purposes. Licensing can be updated based on future deployment or organizational requirements.

---

<p align="center">
  <strong>Eventia Platform</strong><br />
  Smart. Scalable. Professional Event Management Software.
</p>
