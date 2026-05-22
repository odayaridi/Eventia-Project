import React from "react";
import "./Home.css";
import {
  CalendarDays,
  MapPin,
  Ticket,
  QrCode,
  MessageCircle,
  BarChart3,
  Bot,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Megaphone,
  Brain,
  ClipboardCheck,
  Building2,
  History,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="home-page">
      <header className="home-navbar">
        <div className="home-logo">
          <div className="logo-icon">
            <CalendarDays size={22} />
          </div>
          <span>Eventia</span>
        </div>

        <nav className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#roles">Roles</a>
          <a href="#why-eventia">Why Eventia</a>
        </nav>

        <div className="home-nav-actions">
          <button onClick={handleLogin} className="btn btn-outline">
            Log In
          </button>
          <button onClick={handleSignUp} className="btn btn-primary">
            Sign Up
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Centralized Event Management Platform</span>
          </div>

          <h1>Plan, manage, and grow events with a smarter digital experience.</h1>

          <p className="hero-description">
            Eventia connects event organizers, venue owners, and attendees in
            one professional platform for event creation, venue coordination,
            ticket booking, QR attendance tracking, analytics, communication,
            feedback, and AI assistance.
          </p>

          <div className="hero-actions">
            <button onClick={handleSignUp} className="btn btn-primary btn-large">
              Sign Up
              <ArrowRight size={18} />
            </button>
            <button onClick={handleLogin} className="btn btn-secondary btn-large">
              Log In
            </button>
          </div>

          <div className="hero-highlights">
            <div className="highlight-item">
              <CheckCircle2 size={18} />
              <span>Event, venue, booking, and ticket workflows in one place</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={18} />
              <span>Real-time communication between organizers and venue owners</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={18} />
              <span>AI chatbot support and AI-powered feedback analysis</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card main-dashboard-card">
            <div className="card-top">
              <span className="status-dot"></span>
              <span>Live Platform Overview</span>
            </div>

            <div className="dashboard-grid">
              <div className="mini-stat">
                <CalendarDays size={22} />
                <h4>Events</h4>
                <p>Create, update, and manage events with ticket types.</p>
              </div>

              <div className="mini-stat">
                <MapPin size={22} />
                <h4>Venues</h4>
                <p>Request venues, manage availability, and approve bookings.</p>
              </div>

              <div className="mini-stat">
                <QrCode size={22} />
                <h4>QR Check-In</h4>
                <p>Use QR codes for ticket validation and attendance tracking.</p>
              </div>

              <div className="mini-stat">
                <BarChart3 size={22} />
                <h4>Analytics</h4>
                <p>Track revenue, tickets sold, statistics, and feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-section" id="why-eventia">
        <div className="section-heading">
          <span className="section-label">Why Eventia</span>
          <h2>Everything needed to run events in one place</h2>
          <p>
            Eventia replaces scattered calls, messages, spreadsheets, and manual
            tracking with one organized system for planning, booking, ticketing,
            communication, attendance, feedback, and AI support.
          </p>
        </div>

        <div className="why-grid">
          <div className="info-card">
            <ShieldCheck size={28} />
            <h3>Structured & Secure</h3>
            <p>
              Each user works through a clear role-based experience designed for
              their responsibilities.
            </p>
          </div>

          <div className="info-card">
            <Users size={28} />
            <h3>Built for Stakeholders</h3>
            <p>
              Event organizers, venue owners, and attendees work inside one
              connected environment.
            </p>
          </div>

          <div className="info-card">
            <MessageCircle size={28} />
            <h3>Better Coordination</h3>
            <p>
              Real-time chat, announcements, contact requests, and booking
              workflows improve communication.
            </p>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-label">Core Features</span>
          <h2>Designed to simplify the full event lifecycle</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card featured">
            <CalendarDays size={26} />
            <h3>Event Management</h3>
            <p>
              Create and manage events, configure ticket types, and control the
              full event setup process.
            </p>
          </div>

          <div className="feature-card">
            <Building2 size={26} />
            <h3>Venue Management</h3>
            <p>
              Venue owners manage venue profiles, availability, scheduled events,
              and rental requests.
            </p>
          </div>

          <div className="feature-card">
            <Ticket size={26} />
            <h3>Booking & Tickets</h3>
            <p>
              Attendees browse events, book tickets, receive QR codes, and manage
              their booking history.
            </p>
          </div>

          <div className="feature-card">
            <QrCode size={26} />
            <h3>QR Attendance Tracking</h3>
            <p>
              Organizers can validate tickets and track attendance using
              QR-code-based check-in.
            </p>
          </div>

          <div className="feature-card">
            <MessageCircle size={26} />
            <h3>Real-Time Chat</h3>
            <p>
              Organizers and venue owners can communicate directly about venue
              rental inquiries and requests.
            </p>
          </div>

          <div className="feature-card">
            <Bot size={26} />
            <h3>AI Assistance</h3>
            <p>
              Users can use an AI chatbot for help, while organizers can analyze
              attendee feedback using AI.
            </p>
          </div>
        </div>
      </section>

      <section className="roles-section" id="roles">
        <div className="section-heading">
          <span className="section-label">Platform Roles</span>
          <h2>Made for every role in the platform</h2>
          <p>
            Each role has a dedicated experience with the tools needed to manage
            events, venues, bookings, communication, analytics, and feedback.
          </p>
        </div>

        <div className="roles-grid">
          <div className="role-card role-organizer">
            <div className="role-icon">
              <CalendarDays size={26} />
            </div>
            <h3>Event Organizer</h3>
            <ul>
              <li>Create and manage events with ticket types</li>
              <li>Send venue booking requests and contact requests</li>
              <li>Track revenue, tickets sold, and analytics</li>
              <li>Send announcements to attendees</li>
              <li>Chat with venue owners in real time</li>
              <li>Use QR-code-based attendance tracking</li>
              <li>View feedback, analyze it with AI, and use AI chatbot help</li>
            </ul>
          </div>

          <div className="role-card role-venue">
            <div className="role-icon">
              <MapPin size={26} />
            </div>
            <h3>Venue Owner</h3>
            <ul>
              <li>Create and manage venue profiles</li>
              <li>Control venue availability</li>
              <li>Approve or reject booking requests</li>
              <li>View scheduled events and venue statistics</li>
              <li>Send contact requests to admin</li>
              <li>Chat with organizers requesting venue rental</li>
              <li>Use AI chatbot assistance</li>
            </ul>
          </div>

          <div className="role-card role-attendee">
            <div className="role-icon">
              <Ticket size={26} />
            </div>
            <h3>Attendee</h3>
            <ul>
              <li>Browse events and view event details</li>
              <li>Book tickets and receive QR codes</li>
              <li>Manage bookings and booking history</li>
              <li>Submit feedback and ratings</li>
              <li>Use AI chatbot assistance</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="quick-functions-section">
        <div className="section-heading">
          <span className="section-label">Functionality Coverage</span>
          <h2>Key tools available across Eventia</h2>
        </div>

        <div className="quick-functions-grid">
          <div className="quick-function">
            <Megaphone size={22} />
            <span>Announcements</span>
          </div>
          <div className="quick-function">
            <ClipboardCheck size={22} />
            <span>Booking Requests</span>
          </div>
          <div className="quick-function">
            <QrCode size={22} />
            <span>QR Attendance</span>
          </div>
          <div className="quick-function">
            <BarChart3 size={22} />
            <span>Revenue & Statistics</span>
          </div>
          <div className="quick-function">
            <History size={22} />
            <span>Booking History</span>
          </div>
          <div className="quick-function">
            <Star size={22} />
            <span>Feedback & Ratings</span>
          </div>
          <div className="quick-function">
            <Brain size={22} />
            <span>AI Feedback Analysis</span>
          </div>
          <div className="quick-function">
            <Bot size={22} />
            <span>AI Chatbot</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          <div>
            <span className="section-label light">Get Started</span>
            <h2>Join Eventia and make event management seamless</h2>
            <p>
              Whether you are organizing events, managing venues, or attending
              experiences, Eventia helps you work with clarity, speed, and
              confidence.
            </p>
          </div>

          <div className="cta-actions">
            <button onClick={handleSignUp} className="btn btn-light">
              Sign Up
            </button>
            <button onClick={handleLogin} className="btn btn-dark-outline">
              Log In
            </button>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <CalendarDays size={20} />
              <span>Eventia</span>
            </div>

            <p>
              Eventia is a centralized platform designed to simplify event
              management, ticketing, venue coordination, attendance tracking,
              communication, and attendee engagement.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#roles">Roles</a>
              <a href="#why-eventia">Why Eventia</a>
            </div>

            <div className="footer-column">
              <h4>Account</h4>
              <a href="/signup">Sign Up</a>
              <a href="/login">Log In</a>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="#">Report Issue</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Eventia Platform — All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;