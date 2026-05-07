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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {

    const navigate = useNavigate();
    const handleSignUp = () => {
    navigate("/signup"); // <-- navigate to /signup
  };

    const handleLogin = () => {
    navigate("/login"); // <-- navigate to /signup
  };
  return (
    <div className="home-page">
      {/* Navbar */}
      <header className="home-navbar">
        <div className="home-logo">
          <div className="logo-icon">
            <CalendarDays size={22} />
          </div>
          <span>Eventia</span>
        </div>

        <nav className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#roles">Who It’s For</a>
          <a href="#why-eventia">Why Eventia</a>
        </nav>

        <div className="home-nav-actions">
          <button  onClick={handleLogin}  className="btn btn-outline">Log In</button>
          <button  onClick={handleSignUp} className="btn btn-primary">Sign Up</button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Centralized Event Management Platform</span>
          </div>

          <h1>
            Plan, manage, and grow events with a smarter digital experience.
          </h1>

          <p className="hero-description">
            Eventia is a modern web-based platform for concerts, workshops,
            seminars, and conferences. It connects administrators, event
            organizers, venue managers, and attendees in one structured system
            for smoother coordination and a better event experience.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-large">
              Sign Up
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-large">Log In</button>
          </div>

          <div className="hero-highlights">
            <div className="highlight-item">
              <CheckCircle2 size={18} />
              <span>Unified event lifecycle management</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={18} />
              <span>Role-based experience for every user</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={18} />
              <span>Clear, reliable, and scalable workflows</span>
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
                <p>Create and manage organized events easily.</p>
              </div>

              <div className="mini-stat">
                <Ticket size={22} />
                <h4>Tickets</h4>
                <p>Configure ticket types, pricing, and quantities.</p>
              </div>

              <div className="mini-stat">
                <MapPin size={22} />
                <h4>Venues</h4>
                <p>Coordinate venue bookings and availability.</p>
              </div>

              <div className="mini-stat">
                <BarChart3 size={22} />
                <h4>Analytics</h4>
                <p>Track sales, attendance, and event performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Eventia */}
      <section className="why-section" id="why-eventia">
        <div className="section-heading">
          <span className="section-label">Why Eventia</span>
          <h2>Everything needed to run events in one place</h2>
          <p>
            Replace scattered calls, emails, and spreadsheets with a platform
            built to simplify planning, booking, ticketing, communication, and
            attendance tracking.
          </p>
        </div>

        <div className="why-grid">
          <div className="info-card">
            <ShieldCheck size={28} />
            <h3>Structured & Secure</h3>
            <p>
              Role-based access control ensures each user sees only the tools
              relevant to their responsibilities.
            </p>
          </div>

          <div className="info-card">
            <Users size={28} />
            <h3>Built for All Stakeholders</h3>
            <p>
              Admins, organizers, venue managers, and attendees all work inside
              one unified web-based environment.
            </p>
          </div>

          <div className="info-card">
            <MessageCircle size={28} />
            <h3>Better Coordination</h3>
            <p>
              Support communication, announcements, and streamlined workflows
              across the entire event lifecycle.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-label">Core Features</span>
          <h2>Designed to attract visitors and simplify event operations</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card featured">
            <CalendarDays size={26} />
            <h3>Centralized Event Management</h3>
            <p>
              Create, update, and manage events in one organized platform with
              clear workflows and reliable access.
            </p>
          </div>

          <div className="feature-card">
            <MapPin size={26} />
            <h3>Venue Booking & Availability</h3>
            <p>
              Coordinate with venue managers, manage schedules, and reduce the
              risk of double reservations.
            </p>
          </div>

          <div className="feature-card">
            <Ticket size={26} />
            <h3>Smart Ticket Management</h3>
            <p>
              Offer multiple ticket types such as VIP, General, and Early Bird
              with flexible pricing and quantity setup.
            </p>
          </div>

          <div className="feature-card">
            <QrCode size={26} />
            <h3>QR Check-In</h3>
            <p>
              Support digital attendance tracking with QR-based ticket
              validation for a faster check-in experience.
            </p>
          </div>

          <div className="feature-card">
            <BarChart3 size={26} />
            <h3>Analytics & Insights</h3>
            <p>
              Monitor ticket sales, attendance rates, revenue, and platform
              activity through clear dashboards.
            </p>
          </div>

          <div className="feature-card">
            <Bot size={26} />
            <h3>AI Assistance</h3>
            <p>
              Help users with event-related questions and analyze attendee
              feedback for overall event ratings.
            </p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="roles-section" id="roles">
        <div className="section-heading">
          <span className="section-label">Who It’s For</span>
          <h2>Made for every role in the platform</h2>
        </div>

        <div className="roles-grid">
          <div className="role-card">
            <h3>Admins</h3>
            <p>
              Manage user accounts, configure platform settings, and monitor
              system-wide analytics.
            </p>
          </div>

          <div className="role-card">
            <h3>Event Organizers</h3>
            <p>
              Create events, manage tickets, send announcements, request venues,
              and track performance.
            </p>
          </div>

          <div className="role-card">
            <h3>Venue Managers</h3>
            <p>
              Manage venue profiles, control availability, and approve or reject
              booking requests.
            </p>
          </div>

          <div className="role-card">
            <h3>Attendees</h3>
            <p>
              Browse events, book tickets, receive QR codes, and submit feedback
              after the event.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <div>
            <span className="section-label light">Get Started</span>
            <h2>Join Eventia and make event management seamless</h2>
            <p>
              Whether you are organizing events, managing venues, or attending
              experiences, Eventia helps you do it with clarity, speed, and
              confidence.
            </p>
          </div>

          <div className="cta-actions">
            <button className="btn btn-light">Sign Up</button>
            <button className="btn btn-dark-outline">Log In</button>
          </div>
        </div>
      </section>



      {/* Footer */}
<footer className="home-footer">
  <div className="footer-container">

    <div className="footer-brand">
      <div className="footer-logo">
        <CalendarDays size={20} />
        <span>Eventia</span>
      </div>

      <p>
        Eventia is a centralized platform designed to simplify event
        management, ticketing, venue coordination, and attendee
        engagement in one reliable system.
      </p>
    </div>

    <div className="footer-links">
      <div className="footer-column">
        <h4>Platform</h4>
        <a href="#features">Features</a>
        <a href="#roles">User Roles</a>
        <a href="#why-eventia">Why Eventia</a>
      </div>

      <div className="footer-column">
        <h4>Account</h4>
        <a href="/signup">Sign Up</a>
        <a href="/login">Log In</a>
      </div>

      <div className="footer-column">
        <h4>Contact</h4>
        <a href="#">Support</a>
        <a href="#">Help Center</a>
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