// const pool = require("../config/database");

// class EventVenueRequestRepository {
//     constructor() {}

//     /**
//      * Create a new venue request for an event
//      * @param {Object} request - { eventId, venueId }
//      * @returns {Promise<Object>} result of the insert query
//      */
//     async createEventVenueRequestsRepo(eventId,venueId) {
//         const sql = `
//             INSERT INTO EventVenueRequests
//             (event_id, venue_id)
//             VALUES (?, ?)
//         `;

//         // status will default to 'Pending' automatically
//         const [result] = await pool.query(sql, [
//             eventId,
//             venueId
//         ]);

//         return result;
//     }
// }

// module.exports = EventVenueRequestRepository;

const pool = require("../config/database");

class EventVenueRequestRepository {
    constructor() {}

    /**
     * Create a new venue request for an event
     * @param {number} eventId 
     * @param {number} venueAvailabilityId - FK to VenueAvailability
     * @returns {Promise<Object>} result of the insert query
     */
    async createEventVenueRequestsRepo(eventId, venueAvailabilityId) {
        const sql = `
            INSERT INTO EventVenueRequests
            (event_id, venue_availability_id)
            VALUES (?, ?)
        `;

        const [result] = await pool.query(sql, [
            eventId,
            venueAvailabilityId
        ]);

        return result;
    }



    async updateEventVenueReqStatus(status,eventId,venueAvailabilityId){
        let sql = 'UPDATE EventVenueRequests SET status = ? WHERE event_id = ? AND venue_availability_id = ?';
        const [result] = await pool.query(sql,[status,eventId,venueAvailabilityId]);
        return result;
    }


    async countEventBookingReqsRepo(organizerId,status){
        const sql  = 'SELECT COUNT(*) AS count FROM events e JOIN eventvenuerequests evr ON e.id = evr.event_id WHERE e.organizer_id = ? AND STATUS = ?';
        const [result] = await pool.query(sql,[organizerId,status]);
        return result[0];
    }


    async getEventVenueRequestsRepo(organizerId) {

    let sql = `
        SELECT 
            e.name AS eventName, 
            v.name AS venueName, 
            va.date AS eventDate,
            CONCAT(va.start_time, ' - ', va.end_time) AS timing,
            evr.request_date AS requested,
            evr.status AS status
        FROM EventVenueRequests evr
        JOIN Events e 
            ON evr.event_id = e.id
        JOIN VenueAvailability va 
            ON evr.venue_availability_id = va.id
        JOIN Venues v 
            ON va.venue_id = v.id
        WHERE e.organizer_id = ?
    `;

    const [result] = await pool.query(sql, [organizerId]);
    return result;
}

async countEventRequestsRepo(venueId, status){
    const sql = `
        SELECT COUNT(*) AS count
        FROM eventvenuerequests evr
        JOIN events e 
            ON evr.event_id = e.id
        JOIN venueavailability va 
            ON evr.venue_availability_id = va.id
        WHERE va.venue_id = ? 
        AND evr.status = ?
    `;

    const [result] = await pool.query(sql, [venueId, status]);
    return result[0];
}



async updateVenueAvailabilityIdAndStatus(eventId, venueAvailabilityId) {
    const sql = `
            UPDATE EventVenueRequests 
            SET venue_availability_id = ?, status = ?
            WHERE event_id = ?
        `;
    const [rows] = await pool.query(sql, [venueAvailabilityId,'Pending' ,eventId]);
    return rows;
}


}

module.exports = EventVenueRequestRepository;