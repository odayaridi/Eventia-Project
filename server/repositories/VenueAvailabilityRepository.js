const pool = require("../config/database");

class VenueAvailabilityRepository {
  constructor() {}

  async getVenueIdByManagerId(managerId) {
      const [result] = await pool.query('SELECT id from venues where manager_id = ?',[managerId]);
      return result[0]?.id;
  }



async getVenueAvailabilitiesRepo(venueId) {

    const sql = `
  SELECT 
    id,
    DATE_FORMAT(date, '%Y-%m-%d') AS date,
    start_time AS startTime,
    end_time AS endTime,
    price
  FROM VenueAvailability
  WHERE venue_id = ?
    AND status_id = ?
  ORDER BY date ASC, start_time ASC
`;

    const [rows] = await pool.query(sql, [venueId, 1]);

    const grouped = {};

    rows.forEach(row => {
        const dateKey =
          row.date instanceof Date
            ? row.date.toISOString().split("T")[0]
            : row.date;

        if (!grouped[dateKey]) {
            grouped[dateKey] = {
                date: dateKey,
                slots: []
            };
        }

 grouped[dateKey].slots.push({
  id: row.id,
  startTime: row.startTime,
  endTime: row.endTime,
  price: Number(row.price),
});

    });

    return Object.values(grouped);
}




async getVenueBookedTimesRepo(venueId) {
    const sql = `
      SELECT 
        id AS id,
        venue_id AS venueId,
        date AS date,
        start_time AS startTime,
        end_time AS endTime,
        price
      FROM venueavailability
      WHERE venue_id = ?
        AND status_id = ?
      ORDER BY date ASC, start_time ASC
    `;

    const [rows] = await pool.query(sql, [venueId, 2]);

    return rows.map(row => ({
      ...row,
      price: Number(row.price)
    }));
}
  

async createVenueAvailabilityRepo(venueAv) {
    const sql = `
        INSERT INTO VenueAvailability
        (venue_id, date, start_time, end_time, price)
        VALUES (?,?,?,?,?)
    `;

    const [result] = await pool.query(sql, [
        venueAv.venueId,
        venueAv.date,
        venueAv.startTime,
        venueAv.endTime,
        venueAv.price,
    ]);

    return result;
}


async checkVenueAvailabilityOverlapRepo(venueId, date, startTime, endTime) {
    const sql = `
        SELECT * 
        FROM VenueAvailability
        WHERE venue_id = ?
          AND date = ?
          AND status_id = 1
          AND (
                (? < end_time) AND (? > start_time)
              )
    `;

    const [rows] = await pool.query(sql, [
        venueId,
        date,
        startTime,  // newStart
        endTime     // newEnd
    ]);

    return rows.length > 0; // true = conflict exists
}

async getVenueAvailabilityIdByDateAndTime(venueId, date, startTime) {
    const sql = `
        SELECT id 
        FROM VenueAvailability 
        WHERE venue_id = ? AND date = ? AND start_time = ?
    `;
    const [rows] = await pool.query(sql, [venueId, date, startTime]);
    return rows[0].id;
}

async updateVenueAvailabilityStatus(statusId, venueAvailabilityId) {
    const sql = `
        UPDATE VenueAvailability SET status_id = ? WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [statusId, venueAvailabilityId]);
    return rows;
}

 // Upcoming booked slots (date >= today, status_id = 2) for the chart
    async getUpcomingReservationsRepo(venueId) {
        const sql = `
            SELECT
                DATE_FORMAT(va.date, '%Y-%m-%d') AS date,
                COUNT(*) AS slots,
                COALESCE(SUM(va.price), 0) AS revenue
            FROM VenueAvailability va
            WHERE va.venue_id = ?
              AND va.status_id = 2
              AND va.date >= CURDATE()
            GROUP BY va.date
            ORDER BY va.date ASC
            LIMIT 30
        `;
        const [rows] = await pool.query(sql, [venueId]);
        return rows.map(r => ({
            date:    r.date,
            slots:   Number(r.slots),
            revenue: parseFloat(r.revenue),
        }));
    }
 
    // Count available (status_id=1) vs booked (status_id=2) for the donut/bar
    async getBookingByStatusRepo(venueId) {
        const sql = `
            SELECT
                SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) AS available,
                SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) AS booked
            FROM VenueAvailability
            WHERE venue_id = ?
        `;
        const [rows] = await pool.query(sql, [venueId]);
        return {
            available: Number(rows[0]?.available || 0),
            booked:    Number(rows[0]?.booked    || 0),
        };
    }
 


    async getVenueAvailabilityByIdRepo(venueAvailabilityId) {
  const sql = `
    SELECT
      id,
      venue_id AS venueId,
      date,
      start_time AS startTime,
      end_time AS endTime,
      status_id AS statusId,
      price
    FROM VenueAvailability
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [venueAvailabilityId]);

  if (!rows[0]) return null;

  return {
    ...rows[0],
    price: Number(rows[0].price),
  };
}

async checkVenueAvailabilityOverlapForUpdateRepo(
  venueId,
  venueAvailabilityId,
  date,
  startTime,
  endTime
) {
  const sql = `
    SELECT id
    FROM VenueAvailability
    WHERE venue_id = ?
      AND id <> ?
      AND date = ?
      AND status_id = 1
      AND (? < end_time)
      AND (? > start_time)
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [
    venueId,
    venueAvailabilityId,
    date,
    startTime,
    endTime,
  ]);

  return rows.length > 0;
}

async updateVenueAvailabilityRepo(data) {
  const sql = `
    UPDATE VenueAvailability
    SET
      date = ?,
      start_time = ?,
      end_time = ?,
      price = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [
    data.date,
    data.startTime,
    data.endTime,
    data.price,
    data.venueAvailabilityId,
  ]);

  return result;
}

async deleteVenueAvailabilityRepo(venueAvailabilityId) {
  const sql = `
    DELETE FROM VenueAvailability
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [venueAvailabilityId]);
  return result;
}

  
}

module.exports = VenueAvailabilityRepository;

