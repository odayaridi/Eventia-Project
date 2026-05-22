const pool = require("../config/database");

class AdminRepository {
    constructor() {}

    // Venue Manager approval/rejection
    async updateVenueManagerApproval(username, status) {
        const [result] = await pool.query(
            `UPDATE VenueManagers 
             SET approved = ? 
             WHERE user_id = (SELECT id FROM Users WHERE username = ?)`,
            [status, username]
        );
        return result;
    }

    // Event Organizer approval/rejection
    async updateEventOrganizerApproval(username, status) {
        const [result] = await pool.query(
            `UPDATE EventOrganizers 
             SET approved = ? 
             WHERE user_id = (SELECT id FROM Users WHERE username = ?)`,
            [status, username]
        );
        return result;
    }


    async getPendingEventOrganizersRepo(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const baseSql = `
        FROM EventOrganizers eo
        JOIN Users u ON u.id = eo.user_id
        WHERE eo.approved = 0
          AND u.is_deleted = 0
    `;

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
    const [countRows] = await pool.query(countSql);
    const total = countRows[0]?.total || 0;

const dataSql = `
    SELECT
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.email,
        u.username,
        u.phone_number AS phoneNumber,
        eo.organization,
        eo.commercial_registration_document AS commercialRegistrationDocument
    ${baseSql}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
`;
    const [rows] = await pool.query(dataSql, [limit, offset]);

    return {
        pendingEventOrganizers: rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}


    async getPendingVenueManagersRepo(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const baseSql = `
        FROM VenueManagers vm
        JOIN Users u ON u.id = vm.user_id
        WHERE vm.approved = 0
          AND u.is_deleted = 0
    `;

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
    const [countRows] = await pool.query(countSql);
    const total = countRows[0]?.total || 0;

const dataSql = `
    SELECT
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.email,
        u.username,
        u.phone_number AS phoneNumber,
        vm.venue_authorization_document AS venueAuthorizationDocument
    ${baseSql}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
`;

    const [rows] = await pool.query(dataSql, [limit, offset]);

    return {
        pendingVenueManagers: rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}















 /* ==================== GET SINGLE HELPERS ==================== */

    async getAttendeeByIdRepo(attendeeId) {
        const [rows] = await pool.query(
            `
            SELECT
                a.id,
                u.id AS userId,
                u.first_name AS firstName,
                u.last_name AS lastName,
                u.email,
                u.username,
                u.phone_number AS phoneNumber
            FROM Attendees a
            JOIN Users u ON u.id = a.user_id
            WHERE a.id = ?
              AND u.is_deleted = 0
            LIMIT 1
            `,
            [attendeeId]
        );
        return rows[0];
    }

    async getEventOrganizerByIdRepo(organizerId) {
        const [rows] = await pool.query(
            `
            SELECT
                eo.id,
                u.id AS userId,
                u.email,
                u.username,
                u.first_name AS firstName,
                u.last_name AS lastName,
                u.phone_number AS phoneNumber,
                eo.organization
            FROM EventOrganizers eo
            JOIN Users u ON u.id = eo.user_id
            WHERE eo.id = ?
              AND u.is_deleted = 0
            LIMIT 1
            `,
            [organizerId]
        );
        return rows[0];
    }

    async getVenueManagerByIdRepo(managerId) {
        const [rows] = await pool.query(
            `
            SELECT
                vm.id,
                u.id AS userId,
                u.first_name AS firstName,
                u.last_name AS lastName,
                u.email,
                u.username,
                u.phone_number AS phoneNumber
            FROM VenueManagers vm
            JOIN Users u ON u.id = vm.user_id
            WHERE vm.id = ?
              AND u.is_deleted = 0
            LIMIT 1
            `,
            [managerId]
        );
        return rows[0];
    }

    /* ==================== UNIQUE CHECK HELPERS ==================== */

    async findAnotherUserByEmailRepo(email, currentUserId) {
        const [rows] = await pool.query(
            `
            SELECT id
            FROM Users
            WHERE email = ?
              AND id != ?
            LIMIT 1
            `,
            [email, currentUserId]
        );
        return rows[0];
    }

    async findAnotherUserByUsernameRepo(username, currentUserId) {
        const [rows] = await pool.query(
            `
            SELECT id
            FROM Users
            WHERE username = ?
              AND id != ?
            LIMIT 1
            `,
            [username, currentUserId]
        );
        return rows[0];
    }

    async findAnotherUserByPhoneNumberRepo(phoneNumber, currentUserId) {
        const [rows] = await pool.query(
            `
            SELECT id
            FROM Users
            WHERE phone_number = ?
              AND id != ?
            LIMIT 1
            `,
            [phoneNumber, currentUserId]
        );
        return rows[0];
    }

    async getAllAttendeesRepo(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const baseSql = `
    FROM Attendees a
    JOIN Users u ON u.id = a.user_id
    WHERE u.is_deleted = 0
  `;

  const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
  const [countRows] = await pool.query(countSql);
  const total = countRows[0]?.total || 0;

  const dataSql = `
    SELECT
      a.id AS attendeeId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email,
      u.username,
      u.phone_number AS phoneNumber
    ${baseSql}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(dataSql, [limit, offset]);

  return {
    attendees: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}


   async getAllEventOrganizersRepo(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const baseSql = `
    FROM EventOrganizers eo
    JOIN Users u ON u.id = eo.user_id
    WHERE u.is_deleted = 0
  `;

  const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
  const [countRows] = await pool.query(countSql);
  const total = countRows[0]?.total || 0;

  const dataSql = `
    SELECT
      eo.id AS organizerId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email,
      u.username,
      u.phone_number AS phoneNumber,
      eo.organization
    ${baseSql}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(dataSql, [limit, offset]);

  return {
    eventOrganizers: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

    async getAllVenueManagersRepo(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const baseSql = `
    FROM VenueManagers vm
    JOIN Users u ON u.id = vm.user_id
    WHERE u.is_deleted = 0
  `;

  const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
  const [countRows] = await pool.query(countSql);
  const total = countRows[0]?.total || 0;

  const dataSql = `
    SELECT
      vm.id AS managerId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email,
      u.username,
      u.phone_number AS phoneNumber
    ${baseSql}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(dataSql, [limit, offset]);

  return {
    venueManagers: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

     async updateAttendeeRepo({
  attendeeId,
  firstName,
  lastName,
  email,
  username,
  phoneNumber,
}) {
  const [userRows] = await pool.query(
    `
    SELECT u.id AS userId
    FROM Attendees a
    JOIN Users u ON u.id = a.user_id
    WHERE a.id = ?
    LIMIT 1
    `,
    [attendeeId]
  );

  const userId = userRows[0]?.userId;

  if (!userId) {
    return null;
  }

  await pool.query(
    `
    UPDATE Users
    SET 
      first_name = ?,
      last_name = ?,
      email = ?,
      username = ?,
      phone_number = ?
    WHERE id = ?
    `,
    [firstName, lastName, email, username, phoneNumber, userId]
  );

  return await this.getAttendeeByIdRepo(attendeeId);
}


   async updateEventOrganizerRepo({
  organizerId,
  firstName,
  lastName,
  email,
  username,
  phoneNumber,
  organization,
}) {
  const [userRows] = await pool.query(
    `
    SELECT u.id AS userId
    FROM EventOrganizers eo
    JOIN Users u ON u.id = eo.user_id
    WHERE eo.id = ?
    LIMIT 1
    `,
    [organizerId]
  );

  const userId = userRows[0]?.userId;

  await pool.query(
    `
    UPDATE Users
    SET 
      first_name = ?,
      last_name = ?,
      email = ?,
      username = ?,
      phone_number = ?
    WHERE id = ?
    `,
    [firstName, lastName, email, username, phoneNumber, userId]
  );

  await pool.query(
    `
    UPDATE EventOrganizers
    SET organization = ?
    WHERE id = ?
    `,
    [organization, organizerId]
  );

  return await this.getEventOrganizerByIdRepo(organizerId);
}

        async updateVenueManagerRepo({
        managerId,
        firstName,
        lastName,
        email,
        username,
        phoneNumber,
        }) {
        const [userRows] = await pool.query(
            `
            SELECT u.id AS userId
            FROM VenueManagers vm
            JOIN Users u ON u.id = vm.user_id
            WHERE vm.id = ?
            LIMIT 1
            `,
            [managerId]
        );

        const userId = userRows[0]?.userId;

        await pool.query(
            `
            UPDATE Users
            SET 
            first_name = ?,
            last_name = ?,
            email = ?,
            username = ?,
            phone_number = ?
            WHERE id = ?
            `,
            [firstName, lastName, email, username, phoneNumber, userId]
        );

        return await this.getVenueManagerByIdRepo(managerId);
        }

    /* ==================== SOFT DELETE ==================== */

    async softDeleteAttendeeRepo(attendeeId) {
        const [result] = await pool.query(
            `
            UPDATE Users
            SET is_deleted = 1
            WHERE id = (
                SELECT user_id FROM Attendees WHERE id = ?
            )
            `,
            [attendeeId]
        );
        return result;
    }

    async softDeleteEventOrganizerRepo(organizerId) {
        const [result] = await pool.query(
            `
            UPDATE Users
            SET is_deleted = 1
            WHERE id = (
                SELECT user_id FROM EventOrganizers WHERE id = ?
            )
            `,
            [organizerId]
        );
        return result;
    }

    async softDeleteVenueManagerRepo(managerId) {
        const [result] = await pool.query(
            `
            UPDATE Users
            SET is_deleted = 1
            WHERE id = (
                SELECT user_id FROM VenueManagers WHERE id = ?
            )
            `,
            [managerId]
        );
        return result;
}


    // ── User counts ─────────────────────────────────────────────────────────
 
    async countAttendeesRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM Attendees a
            JOIN Users u ON u.id = a.user_id
            WHERE u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    async countEventOrganizersRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM EventOrganizers eo
            JOIN Users u ON u.id = eo.user_id
            WHERE u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    async countVenueManagersTotalRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM VenueManagers vm
            JOIN Users u ON u.id = vm.user_id
            WHERE u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    // ── Events & Venues ──────────────────────────────────────────────────────
 
    async countEventsRepo() {
        const sql = `SELECT COUNT(*) AS cnt FROM Events`;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    async countVenuesRepo() {
        const sql = `SELECT COUNT(*) AS cnt FROM Venues`;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    // ── Pending ───────────────────────────────────────────────────────────────
 
    async countPendingVenueManagersRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM VenueManagers vm
            JOIN Users u ON u.id = vm.user_id
            WHERE vm.approved = 0 AND u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    async countPendingEventOrganizersRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM EventOrganizers eo
            JOIN Users u ON u.id = eo.user_id
            WHERE eo.approved = 0 AND u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    // ── Approval breakdown ────────────────────────────────────────────────────
 
    async countApprovedVenueManagersRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM VenueManagers vm
            JOIN Users u ON u.id = vm.user_id
            WHERE vm.approved = 1 AND u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    async countRejectedVenueManagersRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM VenueManagers vm
            JOIN Users u ON u.id = vm.user_id
            WHERE vm.approved = 2 AND u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    async countApprovedEventOrganizersRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM EventOrganizers eo
            JOIN Users u ON u.id = eo.user_id
            WHERE eo.approved = 1 AND u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }
 
    async countRejectedEventOrganizersRepo() {
        const sql = `
            SELECT COUNT(*) AS cnt
            FROM EventOrganizers eo
            JOIN Users u ON u.id = eo.user_id
            WHERE eo.approved = 2 AND u.is_deleted = 0
        `;
        const [rows] = await pool.query(sql);
        return Number(rows[0]?.cnt || 0);
    }

}
module.exports = AdminRepository;