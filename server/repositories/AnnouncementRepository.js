// const pool = require("../config/database");
// const HttpError = require("../utils/HttpError");
// class AnnouncementRepository {

//   async createAnnouncement(eventId, organizerId, title, message) {
//     // Insert announcement
//     const [result] = await pool.query(
//       `INSERT INTO Announcements (event_id, organizer_id, title, message)
//        VALUES (?, ?, ?, ?)`,
//       [eventId, organizerId, title, message]
//     );

//     // Fetch inserted row
//     const [rows] = await pool.query(
//       `SELECT 
//          id AS announcementId, 
//          event_id AS eventId, 
//          organizer_id AS organizerId, 
//          title,
//          message, 
//          created_at AS createdAt 
//        FROM Announcements 
//        WHERE id = ?`,
//       [result.insertId]
//     );

//     if (!rows || rows.length === 0) throw new HttpError('Announcement not found after insert');

//     return rows[0]; // Return single announcement object
//   }


//   async getOrganizerAnnouncementsRepo(organizerId){
//         const sql = 'SELECT a.title ,a.message,e.name as eventName FROM announcements a JOIN events e ON a.event_id = e.id where a.organizer_id = ?';
//         const [result] = await pool.query(sql,[organizerId]);
//         return result;
//    }

//   // Get announcements for a specific attendee
//   async getAnnouncementsForAttendee(attendeeId) {
//     const [rows] = await pool.query(
//       `SELECT 
//          a.id AS announcementId,
//          a.event_id AS eventId,
//          a.organizer_id AS organizerId,
//          a.title AS title,
//          a.message,
//          a.created_at AS createdAt,
//          e.name AS eventName
//        FROM Announcements a
//        JOIN Events e ON e.id = a.event_id
//        JOIN Bookings b ON b.event_id = e.id
//        WHERE b.attendee_id = ?
//        ORDER BY a.created_at DESC`,
//       [attendeeId]
//     );

//     return rows; 
//   }


//   async getBookedAttendees(eventId) {
//   const [rows] = await pool.query(
//     `SELECT a.id AS attendeeId
//      FROM Attendees a
//      JOIN Bookings b ON b.attendee_id = a.id
//      WHERE b.event_id = ?`,
//     [eventId]
//   );
//   return rows; // rows is array of { attendeeId: ... }
// }
// }

// module.exports = AnnouncementRepository;







const pool = require('../config/database');
const HttpError = require('../utils/HttpError');

class AnnouncementRepository {

    async createAnnouncement(eventId, organizerId, title, message) {
        const [result] = await pool.query(
            `INSERT INTO Announcements (event_id, organizer_id, title, message)
             VALUES (?, ?, ?, ?)`,
            [eventId, organizerId, title, message]
        );

        const [rows] = await pool.query(
            `SELECT
                id           AS announcementId,
                event_id     AS eventId,
                organizer_id AS organizerId,
                title,
                message,
                created_at   AS createdAt
             FROM Announcements
             WHERE id = ?`,
            [result.insertId]
        );

        if (!rows || rows.length === 0) {
            throw new HttpError('Announcement not found after insert');
        }

        return rows[0];
    }

    async getOrganizerAnnouncementsRepo(organizerId) {
        const sql = `
            SELECT
                a.id      AS announcementId,
                a.title,
                a.message,
                a.created_at AS createdAt,
                e.name    AS eventName
            FROM Announcements a
            JOIN Events e ON a.event_id = e.id
            WHERE a.organizer_id = ?
            ORDER BY a.created_at DESC
        `;
        const [result] = await pool.query(sql, [organizerId]);
        return result;
    }

    async getAnnouncementsForAttendee(attendeeId) {
        const [rows] = await pool.query(
            `SELECT
                a.id           AS announcementId,
                a.event_id     AS eventId,
                a.organizer_id AS organizerId,
                a.title,
                a.message,
                a.created_at   AS createdAt,
                e.name         AS eventName
             FROM Announcements a
             JOIN Events e ON e.id = a.event_id
             JOIN Bookings b ON b.event_id = e.id
             WHERE b.attendee_id = ?
             ORDER BY a.created_at DESC`,
            [attendeeId]
        );
        return rows;
    }

    async getBookedAttendees(eventId) {
        const [rows] = await pool.query(
            `SELECT a.id AS attendeeId
             FROM Attendees a
             JOIN Bookings b ON b.attendee_id = a.id
             WHERE b.event_id = ?`,
            [eventId]
        );
        return rows;
    }
}

module.exports = AnnouncementRepository;