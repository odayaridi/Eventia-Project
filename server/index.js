require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');
const venueRoutes = require('./routes/venueRoutes');
const venueAvailablityRoutes = require('./routes/venueAvailabilityRoutes');
const supportRequestOrganizerRoutes = require('./routes/supportRequestOrganizerRoutes');
const supportRequestManagerRoutes = require('./routes/supportRequestManagerRoutes');
const supportRequestAttendeeRoutes = require('./routes/supportRequestAttendeeRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventTicketsRoutes = require('./routes/eventTicketsRoutes');
const eventVenueRequestsRoutes = require('./routes/eventVenueRequestsRoutes');
const ticketRoutes = require('./routes/ticketsRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const eventTypeRoutes = require('./routes/eventTypeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const PaymentController = require('./controllers/PaymentController');
const bookingTicketRoutes = require('./routes/bookingTicketsRoutes');
const eventAttendanceRoutes = require('./routes/eventAttendanceRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const eventFeedbackRoutes = require('./routes/eventFeedbackRoutes');
const profileRoutes = require('./routes/profileRoutes');
const platformSettingsRoutes = require('./routes/platformSettingsRoutes');
const messageRoutes = require('./routes/messageRoutes');
const MessageService = require('./services/MessageService');

const app = express();
const paymentController = new PaymentController();
const messageService = new MessageService();
const server = http.createServer(app);

// 2. Configure CORS Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ===== Socket.IO Setup =====
const io = new Server(server, {
  cors: { origin: '*' },
});

// Connected attendees map
const connectedAttendees = {};

// Connected users map for chat notifications
const connectedUsers = {};

io.on('connection', (socket) => {
  const attendeeId = socket.handshake.query.attendeeId;
  const userId = socket.handshake.query.userId;

  if (attendeeId) connectedAttendees[attendeeId] = socket;

  if (userId) {
    connectedUsers[userId] = socket;
    socket.join(`user_${userId}`);
  }

  socket.on('disconnect', () => {
    if (attendeeId) delete connectedAttendees[attendeeId];
    if (userId) delete connectedUsers[userId];
  });

  socket.on('join_conversation', ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('send_message', async (payload, callback) => {
    try {
      const { conversationId, senderId, message } = payload || {};

      const savedMessage = await messageService.sendMessageService({
        conversationId,
        senderId,
        message,
      });

      io.to(`conversation_${conversationId}`).emit('receive_message', savedMessage);

      const receiverUserId = await messageService.getReceiverUserIdForMessageService(
        conversationId,
        senderId
      );

      if (receiverUserId) {
        const unreadSummary = await messageService.getUnreadSummaryForUserService(
          receiverUserId
        );

        io.to(`user_${receiverUserId}`).emit('unread_messages_updated', {
          receiverUserId,
          conversationId: Number(conversationId),
          totalUnread: unreadSummary.totalUnread,
          message: savedMessage,
        });
      }

      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'Message sent successfully',
          data: savedMessage,
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: error.message || 'Failed to send message',
        });
      }
    }
  });

  socket.on('mark_conversation_read', async (payload, callback) => {
    try {
      const { conversationId, readerUserId } = payload || {};

      await messageService.markConversationReadService({
        conversationId,
        readerUserId,
      });

      const unreadSummary = await messageService.getUnreadSummaryForUserService(
        readerUserId
      );

      io.to(`user_${readerUserId}`).emit('unread_messages_updated', {
        receiverUserId: Number(readerUserId),
        conversationId: Number(conversationId),
        totalUnread: unreadSummary.totalUnread,
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'Conversation marked as read successfully',
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: error.message || 'Failed to mark conversation as read',
        });
      }
    }
  });

  socket.on('webrtc_call_user', async (payload, callback) => {
    try {
      const { conversationId, callerUserId, offer, callType } = payload || {};

      if (!conversationId || !callerUserId || !offer) {
        throw new Error('conversationId, callerUserId, and offer are required');
      }

      const participants = await messageService.getConversationParticipantsService(
        conversationId
      );

      const organizerUserId = Number(participants.organizerUserId);
      const managerUserId = Number(participants.managerUserId);
      const callerId = Number(callerUserId);

      if (callerId !== organizerUserId && callerId !== managerUserId) {
        throw new Error('Caller is not part of this conversation');
      }

      const receiverUserId =
        callerId === organizerUserId ? managerUserId : organizerUserId;

      io.to(`user_${receiverUserId}`).emit('webrtc_incoming_call', {
        conversationId: Number(conversationId),
        callerUserId: callerId,
        receiverUserId,
        callerUsername:
          callerId === organizerUserId
            ? participants.organizerUsername
            : participants.managerUsername,
        callType: callType || 'audio',
        offer,
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'Call request sent successfully',
          receiverUserId,
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: error.message || 'Failed to start call',
        });
      }
    }
  });

  socket.on('webrtc_answer_call', async (payload, callback) => {
    try {
      const { conversationId, callerUserId, receiverUserId, answer } = payload || {};

      if (!conversationId || !callerUserId || !receiverUserId || !answer) {
        throw new Error(
          'conversationId, callerUserId, receiverUserId, and answer are required'
        );
      }

      const participants = await messageService.getConversationParticipantsService(
        conversationId
      );

      const validUsers = [
        Number(participants.organizerUserId),
        Number(participants.managerUserId),
      ];

      if (
        !validUsers.includes(Number(callerUserId)) ||
        !validUsers.includes(Number(receiverUserId))
      ) {
        throw new Error('Invalid call participants');
      }

      io.to(`user_${callerUserId}`).emit('webrtc_call_answered', {
        conversationId: Number(conversationId),
        callerUserId: Number(callerUserId),
        receiverUserId: Number(receiverUserId),
        answer,
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'Call answered successfully',
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: error.message || 'Failed to answer call',
        });
      }
    }
  });

  socket.on('webrtc_ice_candidate', async (payload, callback) => {
    try {
      const { conversationId, senderUserId, receiverUserId, candidate } =
        payload || {};

      if (!conversationId || !senderUserId || !receiverUserId || !candidate) {
        throw new Error(
          'conversationId, senderUserId, receiverUserId, and candidate are required'
        );
      }

      const participants = await messageService.getConversationParticipantsService(
        conversationId
      );

      const validUsers = [
        Number(participants.organizerUserId),
        Number(participants.managerUserId),
      ];

      if (
        !validUsers.includes(Number(senderUserId)) ||
        !validUsers.includes(Number(receiverUserId))
      ) {
        throw new Error('Invalid ICE candidate participants');
      }

      io.to(`user_${receiverUserId}`).emit('webrtc_ice_candidate_received', {
        conversationId: Number(conversationId),
        senderUserId: Number(senderUserId),
        receiverUserId: Number(receiverUserId),
        candidate,
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'ICE candidate sent successfully',
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: error.message || 'Failed to send ICE candidate',
        });
      }
    }
  });

  socket.on('webrtc_reject_call', async (payload, callback) => {
    try {
      const { conversationId, callerUserId, receiverUserId } = payload || {};

      if (!conversationId || !callerUserId || !receiverUserId) {
        throw new Error(
          'conversationId, callerUserId, and receiverUserId are required'
        );
      }

      io.to(`user_${callerUserId}`).emit('webrtc_call_rejected', {
        conversationId: Number(conversationId),
        callerUserId: Number(callerUserId),
        receiverUserId: Number(receiverUserId),
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'Call rejected successfully',
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: error.message || 'Failed to reject call',
        });
      }
    }
  });

  socket.on('webrtc_end_call', async (payload, callback) => {
    try {
      const { conversationId, senderUserId, receiverUserId } = payload || {};

      if (!conversationId || !senderUserId || !receiverUserId) {
        throw new Error(
          'conversationId, senderUserId, and receiverUserId are required'
        );
      }

      io.to(`user_${receiverUserId}`).emit('webrtc_call_ended', {
        conversationId: Number(conversationId),
        senderUserId: Number(senderUserId),
        receiverUserId: Number(receiverUserId),
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'Call ended successfully',
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: error.message || 'Failed to end call',
        });
      }
    }
  });
});

// Make io and connected maps available in req.app
app.set('io', io);
app.set('connectedAttendees', connectedAttendees);
app.set('connectedUsers', connectedUsers);



// ===== Middleware =====
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook.bind(paymentController)
);

app.use(express.json());

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/venue', venueRoutes);
app.use('/api/venueAvailability', venueAvailablityRoutes);
app.use('/api/supportRequestOrganizer', supportRequestOrganizerRoutes);
app.use('/api/supportRequestManager', supportRequestManagerRoutes);
app.use('/api/supportRequestAttendee', supportRequestAttendeeRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/eventTickets', eventTicketsRoutes);
app.use('/api/eventVenueReqs', eventVenueRequestsRoutes);
app.use('/api/eventAttendance', eventAttendanceRoutes);
app.use('/api/eventFeedback', eventFeedbackRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/bookingTickets', bookingTicketRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/eventType', eventTypeRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/platformSettings', platformSettingsRoutes);
app.use('/api/messages', messageRoutes);

// ===== Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
server.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});




