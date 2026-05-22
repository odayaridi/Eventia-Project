const pool = require("../config/database");
const { format } = require('date-fns');
const HttpError = require("../utils/HttpError");
class VenueRepository {
    constructor() {}


      async getVenueIdByManagerId(managerId) {
      const [result] = await pool.query('SELECT id from venues where manager_id = ?',[managerId]);
      return result[0]?.id;
  }
    
    async getVenueIdByNameRepo(name){
        const sql = 'SELECT id from venues where name = ?';
        const [result] = await pool.query(sql,name);
        return result[0].id;
    }


    async getVenueCapacityByIdRepo(venueId){
        const sql = 'SELECT capacity from venues where id = ?';
        const [result] = await pool.query(sql,[venueId]);
        return result[0].capacity;
    }

    async createVenueRepo(newVenue) {
        const sql = `
            INSERT INTO venues 
            (name, location, location_link, capacity, facilities, manager_id) 
            VALUES (?,?,?,?,?,?)
        `;
        const [result] = await pool.query(sql, [
            newVenue.name,
            newVenue.location,
            newVenue.locationLink,
            newVenue.capacity,
            newVenue.facilities,
            newVenue.managerId
        ]);
        return result;
    }


    async updateVenueRepo(dto) {
    const fields = [];
    const values = [];

    if (dto.name !== undefined) {
        const [exists] = await pool.query(
            'SELECT * FROM venues WHERE name = ?  AND id != ?',
            [dto.name, dto.id]
        );

        if (exists.length > 0) {
            throw new HttpError('Venue already exists');
        }

        fields.push("name = ?");
        values.push(dto.name);
    }

    if (dto.location !== undefined) {
        fields.push("location = ?");
        values.push(dto.location);
    }

    if (dto.locationLink !== undefined) {
        fields.push("location_link = ?");
        values.push(dto.locationLink);
    }

    if (dto.capacity !== undefined) {
        fields.push("capacity = ?");
        values.push(dto.capacity);
    }

    if (dto.facilities !== undefined) {
        fields.push("facilities = ?");
        values.push(dto.facilities);
    }

    if (dto.managerId !== undefined) {
        fields.push("manager_id = ?");
        values.push(dto.managerId);
    }

    if (fields.length === 0) return { affectedRows: 0 };

    values.push(dto.id);
    const sql = `UPDATE venues SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(sql, values);

    return result;
}



async filterVenuesRepo(filters) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const values = [];

    const BASE_URL = process.env.BASE_URL;
    const IMAGE_BASE = `${BASE_URL}/uploads/venueImages/`;

    let baseSql = `
    FROM venues v
    JOIN venuemanagers vm ON vm.id = v.manager_id
    JOIN users u ON u.id = vm.user_id

    LEFT JOIN venueavailability va ON va.venue_id = v.id AND va.status_id = 1
    LEFT JOIN venueavailabilitystatus vas ON vas.id = va.status_id
    LEFT JOIN VenueImages vi ON vi.venue_id = v.id

    WHERE 1=1
    AND u.is_deleted = 0
`;

    if (filters.name) {
        baseSql += " AND v.name LIKE ?";
        values.push(`%${filters.name}%`);
    }

    if (filters.location) {
        baseSql += " AND v.location LIKE ?";
        values.push(`%${filters.location}%`);
    }

    if (filters.facilities) {
        const words = filters.facilities.split(" ").filter(Boolean);
        words.forEach(word => {
            baseSql += " AND v.facilities LIKE ?";
            values.push(`%${word}%`);
        });
    }

    if (filters.capacity !== undefined) {
        baseSql += " AND v.capacity >= ?";
        values.push(filters.capacity);
    }

    if (filters.date) {
        baseSql += " AND va.date = ?";
        values.push(filters.date);
    }

    if (filters.start_time) {
        baseSql += " AND va.start_time <= ?";
        values.push(filters.start_time);
    }

    if (filters.end_time) {
        baseSql += " AND va.end_time >= ?";
        values.push(filters.end_time);
    }

    const countSql = `
        SELECT COUNT(DISTINCT v.id) AS total
        ${baseSql}
    `;

    const [countRows] = await pool.query(countSql, values);
    const total = countRows[0]?.total || 0;

    const dataSql = `
        SELECT 
            v.id,
            v.name,
            v.location,
            v.location_link,
            v.capacity,
            v.facilities,
            v.manager_id,
            DATE_FORMAT(v.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,

            JSON_ARRAYAGG(
                DISTINCT JSON_OBJECT(
                    'availability_id', va.id,
                    'date', CASE
                        WHEN va.date IS NOT NULL THEN DATE_FORMAT(va.date, '%Y-%m-%d')
                        ELSE NULL
                    END,
                    'start_time', va.start_time,
                    'end_time', va.end_time,
                    'price', va.price
                )
            ) AS availabilities,

            JSON_ARRAYAGG(
                DISTINCT vi.image_url
            ) AS images

        ${baseSql}

        GROUP BY v.id
        ORDER BY v.id ASC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...values, limit, offset]);

    const cleanedRows = rows.map(row => {
        let images = [];
        let availabilities = [];

        try {
            if (row.images) {
                images = JSON.parse(row.images)
                    .filter(img => img)
                    .map(img => `${IMAGE_BASE}${img}`);
            }
        } catch (err) {
            console.error("Image parsing error:", err);
        }

        try {
            if (row.availabilities) {
                const parsed = JSON.parse(row.availabilities)
                    .filter(a => a.availability_id !== null && a.date !== null);

                const grouped = {};

                parsed.forEach(a => {
                    if (!grouped[a.date]) {
                        grouped[a.date] = {
                            date: a.date,
                            slots: []
                        };
                    }

                    grouped[a.date].slots.push({
                        start_time: a.start_time,
                        end_time: a.end_time,
                        price: Number(a.price)
                    });
                });

                Object.values(grouped).forEach(day => {
                    day.slots.sort((a, b) =>
                        a.start_time.localeCompare(b.start_time)
                    );
                });

                availabilities = Object.values(grouped);
            }
        } catch (err) {
            console.error("Availability parsing error:", err);
        }

        return {
            ...row,
            images,
            availabilities
        };
    });

    return {
        venues: cleanedRows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}








    async getVenuesNamesRepo(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = query.search || '';

    let baseSql = `
        FROM venues v
        INNER JOIN venueavailability va 
            ON va.venue_id = v.id
        WHERE va.status_id = 1
    `;

    const values = [];

    if (search) {
        baseSql += " AND v.name LIKE ?";
        values.push(`%${search}%`);
    }

    // Count distinct venues (important because of join duplication)
    const countSql = `SELECT COUNT(DISTINCT v.id) AS total ${baseSql}`;
    const [countRows] = await pool.query(countSql, values);
    const total = countRows[0]?.total || 0;

    // Get unique venue names
    const dataSql = `
        SELECT DISTINCT v.name
        ${baseSql}
        ORDER BY v.name ASC
        LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataSql, [...values, limit, offset]);

    return {
        venues: rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}


   async getVenueAvailabilityDatesRepo(venueName) {

    let sql = `
        SELECT DISTINCT DATE_FORMAT(va.date, '%Y-%m-%d') AS date
        FROM venueavailability va
        INNER JOIN venues v ON v.id = va.venue_id
        WHERE va.status_id = 1
    `;

    const values = [];

    if (venueName) {
        sql += " AND v.name LIKE ?";
        values.push(`%${venueName}%`);
    }

    sql += " ORDER BY va.date ASC";

    const [rows] = await pool.query(sql, values);

    return rows;
}

  
  async getVenueAvailabilityTimesRepo(venueName,date) {
    const sql = `
        SELECT 
            CONCAT(va.start_time, '-', va.end_time) AS timeSlot
        FROM venueavailability va
        INNER JOIN venues v ON v.id = va.venue_id
        WHERE 
            va.status_id = 1
            AND v.name LIKE ?
            AND va.date = ?
        ORDER BY va.start_time ASC
    `;

    const values = [`%${venueName}%`, date];

    const [rows] = await pool.query(sql, values);

    return rows
}


async fetchEventRequestsRepo(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;
    const { venueId } = query;

    if (!venueId) {
        return { requests: [], total: 0, page, limit, totalPages: 0 };
    }

    const baseSql = `
        FROM EventVenueRequests evr
        JOIN Events e ON evr.event_id = e.id
        JOIN VenueAvailability va ON evr.venue_availability_id = va.id
        JOIN Venues v ON va.venue_id = v.id
        JOIN EventOrganizers eo ON eo.id = e.organizer_id
        JOIN Users u ON u.id = eo.user_id
        JOIN EventTypes et ON et.id = e.event_type_id
        WHERE v.id = ?
    `;

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
    const [countRows] = await pool.query(countSql, [venueId]);
    const total = countRows[0]?.total || 0;

    const dataSql = `
        SELECT 
            e.id AS eventId,
            eo.id AS organizerId,
            u.username AS organizerUsername,
            e.name AS eventName,
            et.name AS eventType,
            e.date AS eventDate,
            e.start_time AS startTime,
            e.end_time AS endTime,
            e.description AS eventDescription,
            e.capacity AS eventCapacity,
            va.id AS venueAvailabilityId,
            v.name AS venueName,
            v.location AS venueLocation,
            evr.status AS requestStatus
        ${baseSql}
        ORDER BY 
            CASE
                WHEN evr.status = 'Pending' THEN 1
                WHEN evr.status = 'Approved' THEN 2
                WHEN evr.status = 'Rejected' THEN 3
                ELSE 4
            END,
            e.date ASC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [venueId, limit, offset]);

    const formattedRows = rows.map(r => ({
        ...r,
        eventDate: format(r.eventDate, 'yyyy-MM-dd')
    }));

    return {
        requests: formattedRows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}


    async hasVenueRepository(managerId){
        let sql = 'SELECT id, name from venues where manager_id = ?';
        const [result] = await pool.query(sql,[managerId]);
        return result[0];
    }


async getVenueInfoRepo(managerId) {
    const sql = `
        SELECT 
            id AS id ,
            name AS name,
            location AS location,
            location_link AS locationLink,
            capacity AS capacity,
            facilities AS facilities,
            created_at AS createdAt
        FROM Venues
        WHERE manager_id = ?
    `;

    const [result] = await pool.query(sql, [managerId]);
    return result[0];
}
   



  async getVenueByManager(managerId) {
        const [rows] = await pool.query(
            `SELECT id FROM venues WHERE manager_id = ?`,
            [managerId]
        );
        return rows[0] || null;
    }

    async countBookedSlots(venueId) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt 
             FROM VenueAvailability 
             WHERE venue_id = ? AND status_id = 2`,
            [venueId]
        );
        return Number(rows[0]?.cnt || 0);
    }

    async countTotalSlots(venueId) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt 
             FROM VenueAvailability 
             WHERE venue_id = ?`,
            [venueId]
        );
        return Number(rows[0]?.cnt || 0);
    }

    async sumBookedRevenue(venueId) {
        const [rows] = await pool.query(
            `SELECT COALESCE(SUM(price), 0) AS revenue
             FROM VenueAvailability
             WHERE venue_id = ? AND status_id = 2`,
            [venueId]
        );
        return parseFloat(rows[0]?.revenue || 0);
    }

    async countVenueRequests(venueId) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt
             FROM EventVenueRequests evr
             JOIN VenueAvailability va 
                ON evr.venue_availability_id = va.id
             WHERE va.venue_id = ?`,
            [venueId]
        );
        return Number(rows[0]?.cnt || 0);
    }
}

module.exports = VenueRepository;