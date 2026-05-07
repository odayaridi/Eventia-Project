import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/home/Home";
import SignUp from "../pages/auth/SignUp";
import Login from "../pages/auth/Login";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layout/Dashboard";

import ManagerDashboard from "../pages/manager/VenueDashboard";
import AttendeeDashboard from "../pages/attendee/AttendeeDashboard";
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import MyVenue from "../pages/manager/MyVenue";
import VenueAvailablity from "../pages/manager/VenueAvailability";
import EventRequests from "../pages/manager/EventRequests";
import ContactSupport from "../pages/manager/ContactSupport";
import VenueRequests from "../pages/organizer/VenueRequests";
import OrganizerContactSupport from "../pages/organizer/OrganizerContactSupport";
import EventTickets from "../pages/organizer/EventTickets";
import MyEvents from "../pages/organizer/MyEvents";
import BrowseVenues from "../pages/organizer/BrowseVenues";
import BrowseEvents from "../pages/attendee/BrowseEvents";
import AttendeeContactSupport from "../pages/attendee/AttendeeContactSupport";
import EventDetails from "../pages/attendee/EventDetails";
import PaymentSuccess from "../pages/attendee/PaymentSuccess";
import MyBookings from "../pages/attendee/MyBookings";
import MyTickets from "../pages/attendee/MyTickets";
import Forbidden from "../components/common/Forbidden";
import NotFound from "../components/common/NotFound";
import ValidateTicket from "../pages/organizer/ValidateTicket";
import AIAssistant from "../pages/attendee/AlAssistant";
import MyFeedbacks from "../pages/attendee/MyFeedbacks";
import Feedbacks from "../pages/organizer/Feedbacks";
import Announcements from "../pages/attendee/Announcements";
import MyAnnouncements from "../pages/organizer/MyAnnouncements";
import ManagerProfile from "../pages/manager/MangerProfile";
import OrgananizerProfile from "../pages/organizer/OrganizerProfile";
import AttendeeProfile from "../pages/attendee/AttendeeProfile";
import OrganizerAIAssistant from "../pages/organizer/OrganizerAIAssistant";
import ManagerAIAssistant from "../pages/manager/ManagerAIAssistant";
import PendingApprovals from "../pages/admin/PendingApprovals";
import Attendee from "../pages/admin/Attendee";
import Managers from "../pages/admin/Managers";
import Organizers from "../pages/admin/Organizers";
import ContactRequests from "../pages/admin/ContactRequests";
import PlatformSettings from "../pages/admin/PlatformSettings";
import ForgotPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Attendance from "../pages/organizer/Attendance";
import Analytics from "../pages/organizer/Analytics";
import ChatRoom from "../pages/organizer/ChatRoom";
import MessageOrganizers from "../pages/manager/MessageOrganizers";
// import PaymentSuccess from "../pages/attendee/PaymentSuccess";
//...assume imports above
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />


<Route path="/forget-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

      {/* Organizer */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRoles={["eventOrganizer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="support" element={<OrganizerContactSupport />} />
         <Route path="venue-requests" element={<VenueRequests />} />
           <Route path="event-tickets" element={<EventTickets />} />
                <Route path="events" element={<MyEvents />} />
              <Route path="browse-venues" element={<BrowseVenues />} />
                     <Route path="feedbacks" element={<Feedbacks />} />
                         <Route path="my-announcements" element={<MyAnnouncements />} />
                         <Route path="profile" element={<OrgananizerProfile />} />
                          <Route path="chatbot" element={<OrganizerAIAssistant />} />
                           <Route path="attendance" element={<Attendance />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="chat-room" element={<ChatRoom />} />
  <Route path="chat-room/venue/:venueId" element={<ChatRoom />} />
      </Route>


      <Route
  path="/organizer/validateTicket/:ticketCode"
  element={
    <ProtectedRoute allowedRoles={["eventOrganizer"]}>
      <ValidateTicket/>
    </ProtectedRoute>
  }
/>

      {/* Venue */}
      {/* <Route
        path="/venue"
        element={
          <ProtectedRoute allowedRoles={["venueManager"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="my-venue" element={<MyVenue />} />
         <Route path="availability" element={<VenueAvailablity />} />
          <Route path="event-requests" element={<EventRequests />} />
           <Route path="support" element={<ContactSupport />} />
           <Route path="profile" element={<ManagerProfile />} />
            <Route path="chatbot" element={<ManagerAIAssistant />} />
      </Route> */}

      {/* Attendee */}
      <Route
        path="/attendee"
        element={
          <ProtectedRoute allowedRoles={["attendee"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="bookings" replace />} />
        <Route path="dashboard" element={<AttendeeDashboard />} />
         <Route path="browse" element={<BrowseEvents />} />
           <Route path="support" element={<AttendeeContactSupport />} />
            <Route path="events/:eventId" element={<EventDetails />} />
            <Route path="success" element={<PaymentSuccess />} />
                 <Route path="bookings" element={<MyBookings />} />
                 <Route path="tickets" element={<MyTickets />} />
                  <Route path="chatbot" element={<AIAssistant />} />
                   <Route path="myfeedbacks" element={<MyFeedbacks />} />
                      <Route path="announcements" element={<Announcements />} />
                       <Route path="profile" element={<AttendeeProfile />} />
      </Route>







 {/* Venue */}
      <Route
        path="/venue"
        element={
          <ProtectedRoute allowedRoles={["venueManager"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="my-venue" element={<MyVenue />} />
         <Route path="availability" element={<VenueAvailablity />} />
          <Route path="event-requests" element={<EventRequests />} />
           <Route path="support" element={<ContactSupport />} />
           <Route path="profile" element={<ManagerProfile />} />
            <Route path="chatbot" element={<ManagerAIAssistant />} />
            <Route path="message-organizers" element={<MessageOrganizers />} />
            <Route path="message-organizers/organizer/:organizerId" element={<MessageOrganizers />} />
      </Route>

      {/* Admin */}
   <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="pending-approvals" element={<PendingApprovals />} />
     <Route path="attendees" element={<Attendee />} />
     <Route path="venue-managers" element={<Managers />} />
     <Route path="event-organizers" element={<Organizers />} />

<Route path="contact-requests" element={<ContactRequests />} />
<Route path="platform-settings" element={<PlatformSettings />} />
  <Route path="dashboard" element={<AdminDashboard/>} />
</Route>




      {/* <Route path="*" element={<Navigate to="/home" replace />} /> */}
            <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}