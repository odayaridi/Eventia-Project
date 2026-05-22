const pool = require("../config/database");
const { format } = require('date-fns'); // import date-fns

class EventRepository {
    constructor() {}


    async getEventByIdRepo(eventId){
        const sql = 'SELECT * FROM events where id = ?';
        const [result] = await pool.query(sql,[eventId]);
        return result[0];
    }

    async getEventIdByName(eventName) {
        const sql = 'SELECT id FROM events WHERE name = ?';
        const [result] = await pool.query(sql,eventName);
        return result[0]?.id;
    }

    async createEventRepo(event) {
        const sql = `
            INSERT INTO events 
            (organizer_id, venue_availability_id, event_type_id, name, description, image_url, date, start_time, end_time, capacity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        `;

        const [result] = await pool.query(sql, [
            event.organizerId,
            event.venueAvailabilityId || null,  // allow null if not set
            event.eventTypeId,
            event.name,
            event.description,
            event.imageUrl,
            event.date,
            event.startTime,   // should be a JS Date or string 'YYYY-MM-DD HH:MM:SS'
            event.endTime,     // same as above
            event.capacity
        ]);

        return result;
    }

    async checkEventExistsRepo(name) {
        const sql = 'SELECT id , name FROM events WHERE name = ?';
        const [result] = await pool.query(sql, [name]);
        return result[0];
    }

    async approveEventRequestRepo(eventId,venueAvailabilityId){
        let sql = 'UPDATE events set venue_availability_id = ? where id = ?';
        const [result] = await pool.query(sql,[venueAvailabilityId,eventId]);
        return result;
    }

    async getEventNamesRepo(organizerId){
        let sql = 'SELECT name from events where organizer_id = ? AND venue_availability_id is not null AND status_id = ?';
        const [result] = await pool.query(sql,[organizerId, 1]);
        return result;
    }



        async getUpcomingEventNamesRepo(organizerId){
        let sql = 'SELECT name from events e where organizer_id = ? AND venue_availability_id is not null AND status_id = ? ';
        const [result] = await pool.query(sql,[organizerId, 1]);
        return result;
    }


  async getEndedEventNamesRepo(organizerId) {
    const now = new Date();

    const sql = `
        SELECT name
        FROM events
        WHERE organizer_id = ?
          AND venue_availability_id IS NOT NULL
          AND TIMESTAMP(date, end_time) < ?
    `;

    const [result] = await pool.query(sql, [organizerId, now]);
    return result;
}


async filterEventsRepo(filters) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;
    

    let baseSql = `
    FROM Events e
    JOIN EventOrganizers eo ON eo.id = e.organizer_id
    JOIN Users u ON u.id = eo.user_id

    JOIN VenueAvailability va ON e.venue_availability_id = va.id
    JOIN Venues v ON va.venue_id = v.id
    JOIN EventTypes et ON e.event_type_id = et.id
    LEFT JOIN EventTickets etk ON e.id = etk.event_id
    LEFT JOIN TicketTypes tt ON etk.ticket_type_id = tt.id

    WHERE e.status_id = 1
      AND e.venue_availability_id IS NOT NULL
      AND u.is_deleted = 0
   AND TIMESTAMP(e.date, va.end_time) > NOW()

`;

    // AND TIMESTAMP(e.date, va.end_time) > NOW()

    const values = [];

    if (filters.eventName) {
        baseSql += ` AND e.name LIKE ?`;
        values.push(`%${filters.eventName}%`);
    }

    if (filters.venueName) {
        baseSql += ` AND v.name LIKE ?`;
        values.push(`%${filters.venueName}%`);
    }

    if (filters.date) {
        baseSql += ` AND e.date = ?`;
        values.push(filters.date);
    }

    if (filters.startTime) {
        baseSql += ` AND va.start_time >= ?`;
        values.push(filters.startTime);
    }

    if (filters.endTime) {
        baseSql += ` AND va.end_time <= ?`;
        values.push(filters.endTime);
    }

    if (filters.description) {
        const words = filters.description.split(" ").filter(Boolean);
        const conditions = words.map(() => "e.description LIKE ?").join(" OR ");
        baseSql += ` AND (${conditions})`;
        values.push(...words.map(word => `%${word}%`));
    }

    if (filters.eventTypeId) {
        baseSql += ` AND e.event_type_id = ?`;
        values.push(filters.eventTypeId);
    }

    // Count total DISTINCT events
    const countSql = `SELECT COUNT(DISTINCT e.id) AS total ${baseSql}`;
    const [countRows] = await pool.query(countSql, values);
    const total = countRows[0]?.total || 0;

    // Get paginated data
    const dataSql = `
        SELECT 
            e.id AS eventId,
            e.organizer_id AS organizerId,
            e.venue_availability_id AS venueAvailabilityId,
            e.name AS eventName,
            e.description AS eventDescription,
            e.image_url AS imageUrl,
            e.date AS eventDate,
            va.start_time AS startTime,
            va.end_time AS endTime,
            e.capacity AS eventCapacity,
            v.name AS venueName,
            et.name AS eventType,
            etk.id AS eventTicketId,
            tt.name AS ticketTypeName,
            etk.perks AS eventTicketPerks,
            etk.price AS ticketPrice,
            etk.quantity_available AS quantityAvailable,
            etk.quantity_sold AS quantitySold
        ${baseSql}
        ORDER BY e.date ASC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...values, limit, offset]);

    const IMAGE_BASE = `${process.env.BASE_URL}/uploads/eventsImages`;
    // Group tickets under each event
    const eventsMap = {};

    rows.forEach(row => {
        const eventId = row.eventId;

        if (!eventsMap[eventId]) {
            eventsMap[eventId] = {
                eventId: row.eventId,
                organizerId: row.organizerId,
                venueAvailabilityId: row.venueAvailabilityId,
                eventName: row.eventName,
                eventDescription: row.eventDescription,
                imageUrl: row.imageUrl
    ? `${IMAGE_BASE}/${row.imageUrl}`
    : null,
                eventDate: row.eventDate ? format(row.eventDate, 'yyyy-MM-dd') : null,
                startTime: row.startTime,
                endTime: row.endTime,
                eventCapacity: row.eventCapacity,
                venueName: row.venueName,
                eventType: row.eventType,
                tickets: []
            };
        }

        if (row.eventTicketId) {
            eventsMap[eventId].tickets.push({
                eventTicketId: row.eventTicketId,
                ticketTypeName: row.ticketTypeName,
                eventTicketPerks: row.eventTicketPerks,
                ticketPrice: row.ticketPrice,
                quantityAvailable: row.quantityAvailable,
                quantitySold: row.quantitySold,
                remainingTickets: row.quantityAvailable - row.quantitySold
            });
        }
    });

    return {
        events: Object.values(eventsMap),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}


async getEventsByOrganizerRepo(organizerId) {
    //  Get events with basic info + venue request status
    const sql = `
        SELECT 
            e.id AS eventId,
            e.organizer_id AS organizerId,
            e.venue_availability_id AS venueAvailabilityId,
            e.name,
            e.description,
            e.image_url AS imageUrl,
            e.start_time AS startTime,
            e.end_time AS endTime,
            e.capacity,
            e.created_at AS createdAt,
            e.date,
            et.name AS eventType,
            evr.status AS eventStatus
        FROM events e
        JOIN EventTypes et ON e.event_type_id = et.id
        LEFT JOIN EventVenueRequests evr 
            ON e.id = evr.event_id
        WHERE e.organizer_id = ?
        ORDER BY e.created_at DESC
    `;

    const [rows] = await pool.query(sql, [organizerId]);

    //  Loop over each event and fetch venueName
    const eventsWithVenue = await Promise.all(
        rows.map(async (event) => {
            if (!event.eventId) return event;

            const venueSql = `
                SELECT v.name AS venueName
                FROM eventvenuerequests evr
                JOIN venueavailability va ON evr.venue_availability_id = va.id
                JOIN venues v ON v.id = va.venue_id
                WHERE evr.event_id = ?
                ORDER BY evr.id DESC
                LIMIT 1
            `;
            const [venueRows] = await pool.query(venueSql, [event.eventId]);
            const venueName = venueRows[0]?.venueName || null;

            return {
                ...event,
                venueName
            };
        })
    );

    return eventsWithVenue;
}



async updateEventRepo(existingEvent) { 
    const sql = `
        UPDATE events SET
            event_type_id = ?,
            name = ?,
            description = ?,
            image_url = ?,
            date = ?,
            start_time = ?,
            end_time = ?,
            capacity = ?
        WHERE id = ?
    `;

    const values = [
        existingEvent.eventTypeId,
        existingEvent.name,
        existingEvent.description,
        existingEvent.imageUrl,
        existingEvent.date,
        existingEvent.startTime,
        existingEvent.endTime,
        existingEvent.capacity,
        existingEvent.eventId
    ];

    await pool.query(sql, values);
}


async getEventById(eventId) {
    const sql = 'SELECT * FROM events WHERE id = ?';
    const [rows] = await pool.query(sql, [eventId]);
    return rows[0];
}




    async getEventCapacityById(eventId) {
    const sql = `
        SELECT capacity
        FROM Events
        WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [eventId]);
    return rows[0]?.capacity;
    }


    async getDashboardTotalEventsRepo(organizerId) {
        const sql = `SELECT COUNT(*) AS totalEvents FROM events WHERE organizer_id = ?`;
        const [rows] = await pool.query(sql, [organizerId]);
        return { totalEvents: Number(rows[0]?.totalEvents || 0) };
    }
 
 
    async getDashboardTicketsSoldRepo(organizerId) {
        const sql = `
            SELECT COALESCE(SUM(et.quantity_sold), 0) AS totalTicketsSold
            FROM eventtickets et
            JOIN events e ON et.event_id = e.id
            WHERE e.organizer_id = ?
        `;
        const [rows] = await pool.query(sql, [organizerId]);
        return { totalTicketsSold: Number(rows[0]?.totalTicketsSold || 0) };
    }
 
    // 3. Total revenue (sum of completed payments for organizer's events)
    async getDashboardTotalRevenueRepo(organizerId) {
        const sql = `
            SELECT COALESCE(SUM(p.amount), 0) AS totalRevenue
            FROM payments p
            JOIN events e ON p.event_id = e.id
            JOIN paymentstatus ps ON ps.id = p.status_id
            WHERE e.organizer_id = ? AND ps.name = 'completed'
        `;
        const [rows] = await pool.query(sql, [organizerId]);
        return { totalRevenue: parseFloat(rows[0]?.totalRevenue || 0) };
    }
 
    // 4. Avg attendance rate:
    //    attendance_rate per event = (checked-in attendees / event capacity) * 100
    //    avg across all organizer events that have attendance records
    async getDashboardAvgAttendanceRepo(organizerId) {
        const sql = `
            SELECT
                COALESCE(
                    ROUND(
                        AVG(
                            (checkin_counts.checkin_count / e.capacity) * 100
                        ), 1
                    ),
                0) AS avgAttendanceRate
            FROM events e
            JOIN (
                SELECT ea.event_id, COUNT(*) AS checkin_count
                FROM eventattendance ea
                GROUP BY ea.event_id
            ) AS checkin_counts ON checkin_counts.event_id = e.id
            WHERE e.organizer_id = ? AND e.capacity > 0
        `;
        const [rows] = await pool.query(sql, [organizerId]);
        return { avgAttendanceRate: parseFloat(rows[0]?.avgAttendanceRate || 0) };
    }
 
    // 5. Revenue per event for bar chart
    async getDashboardRevenuePerEventRepo(organizerId) {
        const sql = `
            SELECT
                e.name AS eventName,
                e.id   AS eventId,
                COALESCE(SUM(p.amount), 0) AS revenue
            FROM events e
            LEFT JOIN payments p
                ON p.event_id = e.id
                AND p.status_id = (SELECT id FROM paymentstatus WHERE name = 'completed')
            WHERE e.organizer_id = ?
            GROUP BY e.id, e.name
            ORDER BY revenue DESC
        `;
        const [rows] = await pool.query(sql, [organizerId]);
 
        // Compute total so frontend can show percentages
        const totalRevenue = rows.reduce((sum, r) => sum + parseFloat(r.revenue), 0);
        const data = rows.map(r => ({
            eventName: r.eventName,
            eventId:   r.eventId,
            revenue:   parseFloat(r.revenue),
            percentage: totalRevenue > 0
                ? parseFloat(((parseFloat(r.revenue) / totalRevenue) * 100).toFixed(1))
                : 0,
        }));
 
        return { revenuePerEvent: data, totalRevenue };
    }
 
    // 6. Events created in the current calendar month
    async getDashboardEventsThisMonthRepo(organizerId) {
        const sql = `
            SELECT COUNT(*) AS eventsThisMonth
            FROM events
            WHERE organizer_id = ?
              AND MONTH(created_at) = MONTH(CURDATE())
              AND YEAR(created_at)  = YEAR(CURDATE())
        `;
        const [rows] = await pool.query(sql, [organizerId]);
        return { eventsThisMonth: Number(rows[0]?.eventsThisMonth || 0) };
    }
 
    // 7. Pending venue requests (events without a confirmed venue_availability_id)
    async getDashboardPendingVenueRequestsRepo(organizerId) {
        const sql = `
            SELECT COUNT(*) AS pendingVenueRequests
            FROM events
            WHERE organizer_id = ?
              AND venue_availability_id IS NULL
        `;
        const [rows] = await pool.query(sql, [organizerId]);
        return { pendingVenueRequests: Number(rows[0]?.pendingVenueRequests || 0) };
    }
 
    // 8. Total announcements across all organizer events
    async getDashboardTotalAnnouncementsRepo(organizerId) {
        const sql = `
            SELECT COUNT(*) AS totalAnnouncements
            FROM announcements
            WHERE organizer_id = ?
        `;
        const [rows] = await pool.query(sql, [organizerId]);
        return { totalAnnouncements: Number(rows[0]?.totalAnnouncements || 0) };
    }
 
    // 9. Total feedbacks across all organizer events
    async getDashboardTotalFeedbacksRepo(organizerId) {
        const sql = `
            SELECT COUNT(*) AS totalFeedbacks
            FROM eventfeedback ef
            JOIN events e ON ef.event_id = e.id
            WHERE e.organizer_id = ?
        `;
        const [rows] = await pool.query(sql, [organizerId]);
        return { totalFeedbacks: Number(rows[0]?.totalFeedbacks || 0) };
    }


    async checkEventEnded(eventName){
        const nowDate = new Date();
        const sql = 'SELECT TIMESTAMP(date, end_time) as time FROM events WHERE name = ?';
        const [result] = await pool.query(sql,[eventName]);
       return result[0].time <= nowDate;
    }
 


      async getEndedEventNamesRepo(organizerId) {
        const now = new Date();
        const sql = `
            SELECT name
            FROM events
            WHERE organizer_id = ?
            AND venue_availability_id IS NOT NULL
            AND TIMESTAMP(date, end_time) < ?
        `;

    const [result] = await pool.query(sql, [organizerId, now]);
    return result;
}



async deleteEventRepo(eventId){
    const sql = 'DELETE From events WHERE id = ?';
    const [result] = await pool.query(sql,[eventId]);
    return result;
}



}

module.exports = EventRepository;