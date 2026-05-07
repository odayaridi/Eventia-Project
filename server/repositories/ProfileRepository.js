const pool = require("../config/database");

class ProfileRepository {
 async getAttendeeProfileRepo(attendeeId) {
  const sql = `
    SELECT
      u.id AS userId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email,
      u.username,
      u.phone_number AS phoneNumber
    FROM attendees a
    JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
      AND u.is_deleted = 0
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [attendeeId]);
  return rows[0];
}
  

async getEventOrganizerProfileRepo(organizerId) {
  const sql = `
    SELECT
      u.id AS userId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email,
      u.username,
      u.phone_number AS phoneNumber,
      eo.organization
    FROM eventorganizers eo
    JOIN users u ON u.id = eo.user_id
    WHERE eo.id = ?
      AND u.is_deleted = 0
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [organizerId]);
  return rows[0];
}


  async getVenueManagerProfileRepo(managerId) {
  const sql = `
    SELECT
      u.id AS userId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email,
      u.username,
      u.phone_number AS phoneNumber
    FROM venuemanagers vm
    JOIN users u ON u.id = vm.user_id
    WHERE vm.id = ?
      AND u.is_deleted = 0
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [managerId]);
  return rows[0];
}

  async findAnotherUserByEmailRepo(email, currentUserId) {
    const sql = `
      SELECT id
      FROM users
      WHERE email = ?
        AND id != ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [email, currentUserId]);
    return rows[0];
  }

  async findAnotherUserByUsernameRepo(username, currentUserId) {
    const sql = `
      SELECT id
      FROM users
      WHERE username = ?
        AND id != ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [username, currentUserId]);
    return rows[0];
  }

  async findAnotherUserByPhoneNumberRepo(phoneNumber, currentUserId) {
    const sql = `
      SELECT id
      FROM users
      WHERE phone_number = ?
        AND id != ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [phoneNumber, currentUserId]);
    return rows[0];
  }

  async editAttendeeProfileRepo({
  attendeeId,
  firstName,
  lastName,
  email,
  username,
  phoneNumber,
}) {
  const getUserSql = `
    SELECT u.id AS userId
    FROM attendees a
    JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
    LIMIT 1
  `;

  const [userRows] = await pool.query(getUserSql, [attendeeId]);
  const userId = userRows[0]?.userId;

  const fields = [];
  const values = [];

  if (firstName !== undefined) {
    fields.push("first_name = ?");
    values.push(firstName);
  }

  if (lastName !== undefined) {
    fields.push("last_name = ?");
    values.push(lastName);
  }

  if (email !== undefined) {
    fields.push("email = ?");
    values.push(email);
  }

  if (username !== undefined) {
    fields.push("username = ?");
    values.push(username);
  }

  if (phoneNumber !== undefined) {
    fields.push("phone_number = ?");
    values.push(phoneNumber);
  }

  if (!fields.length) {
    return await this.getAttendeeProfileRepo(attendeeId);
  }

  const updateSql = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  values.push(userId);

  const [result] = await pool.query(updateSql, values);

  if (result.affectedRows !== 1) {
    throw new Error("Attendee profile not found or nothing to update");
  }

  return await this.getAttendeeProfileRepo(attendeeId);
}
}

module.exports = ProfileRepository;