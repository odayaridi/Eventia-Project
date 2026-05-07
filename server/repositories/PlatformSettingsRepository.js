const pool = require("../config/database");

class PlatformSettingsRepository {
  /* ==================== EVENT TYPES ==================== */

  async getEventTypeNamesRepo() {
    const [rows] = await pool.query(`
      SELECT id, name
      FROM EventTypes
      ORDER BY name ASC
    `);

    return rows;
  }

  async findEventTypeByIdRepo(id) {
    const [rows] = await pool.query(
      `
      SELECT id, name
      FROM EventTypes
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0];
  }

  async findEventTypeByNameRepo(name) {
    const [rows] = await pool.query(
      `
      SELECT id, name
      FROM EventTypes
      WHERE name = ?
      LIMIT 1
      `,
      [name]
    );

    return rows[0];
  }

  async addEventTypeRepo(name) {
    const [result] = await pool.query(
      `
      INSERT INTO EventTypes (name)
      VALUES (?)
      `,
      [name]
    );

    return {
      id: result.insertId,
      name,
    };
  }

  async editEventTypeRepo(id, name) {
    await pool.query(
      `
      UPDATE EventTypes
      SET name = ?
      WHERE id = ?
      `,
      [name, id]
    );

    return await this.findEventTypeByIdRepo(id);
  }

  async deleteEventTypeRepo(id) {
    const [result] = await pool.query(
      `
      DELETE FROM EventTypes
      WHERE id = ?
      `,
      [id]
    );

    return result;
  }

  /* ==================== TICKET TYPES ==================== */

  async getTicketTypeNamesRepo() {
    const [rows] = await pool.query(`
      SELECT id, name
      FROM TicketTypes
      ORDER BY name ASC
    `);

    return rows;
  }

  async findTicketTypeByIdRepo(id) {
    const [rows] = await pool.query(
      `
      SELECT id, name
      FROM TicketTypes
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0];
  }

  async findTicketTypeByNameRepo(name) {
    const [rows] = await pool.query(
      `
      SELECT id, name
      FROM TicketTypes
      WHERE name = ?
      LIMIT 1
      `,
      [name]
    );

    return rows[0];
  }

  async addTicketTypeRepo(name) {
    const [result] = await pool.query(
      `
      INSERT INTO TicketTypes (name)
      VALUES (?)
      `,
      [name]
    );

    return {
      id: result.insertId,
      name,
    };
  }

  async editTicketTypeRepo(id, name) {
    await pool.query(
      `
      UPDATE TicketTypes
      SET name = ?
      WHERE id = ?
      `,
      [name, id]
    );

    return await this.findTicketTypeByIdRepo(id);
  }

  async deleteTicketTypeRepo(id) {
    const [result] = await pool.query(
      `
      DELETE FROM TicketTypes
      WHERE id = ?
      `,
      [id]
    );

    return result;
  }
}

module.exports = PlatformSettingsRepository;