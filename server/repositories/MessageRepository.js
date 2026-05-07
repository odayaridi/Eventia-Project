const pool = require("../config/database");

class MessageRepository {
  constructor() {}

  async checkOrganizerExistsRepo(organizerId) {
    const sql = `SELECT id FROM EventOrganizers WHERE id = ?`;
    const [rows] = await pool.query(sql, [organizerId]);
    return rows[0];
  }

  async checkManagerExistsRepo(managerId) {
    const sql = `SELECT id FROM VenueManagers WHERE id = ?`;
    const [rows] = await pool.query(sql, [managerId]);
    return rows[0];
  }

  async checkVenueExistsRepo(venueId) {
    const sql = `SELECT id FROM Venues WHERE id = ?`;
    const [rows] = await pool.query(sql, [venueId]);
    return rows[0];
  }

  async checkUserExistsRepo(userId) {
    const sql = `SELECT id FROM Users WHERE id = ?`;
    const [rows] = await pool.query(sql, [userId]);
    return rows[0];
  }

  async findConversationRepo(organizerId, managerId, venueId) {
    let sql = `
      SELECT
        c.id,
        c.organizer_id AS organizerId,
        c.manager_id AS managerId,
        c.venue_id AS venueId,
        c.created_at AS createdAt
      FROM Conversations c
      WHERE c.organizer_id = ?
        AND c.manager_id = ?
    `;

    const values = [organizerId, managerId];

    if (venueId === null) {
      sql += ` AND c.venue_id IS NULL`;
    } else {
      sql += ` AND c.venue_id = ?`;
      values.push(venueId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await pool.query(sql, values);
    return rows[0];
  }

  async createConversationRepo(payload) {
    const { organizerId, managerId, venueId } = payload;

    const sql = `
      INSERT INTO Conversations
        (organizer_id, manager_id, venue_id)
      VALUES (?, ?, ?)
    `;

    const [result] = await pool.query(sql, [organizerId, managerId, venueId]);
    return result;
  }

  async getConversationByIdRepo(conversationId) {
    const sql = `
      SELECT
        c.id,
        c.organizer_id AS organizerId,
        c.manager_id AS managerId,
        c.venue_id AS venueId,
        c.created_at AS createdAt
      FROM Conversations c
      WHERE c.id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [conversationId]);
    return rows[0];
  }

  async createMessageRepo(payload) {
    const { conversationId, senderId, message } = payload;

    const sql = `
      INSERT INTO Messages
        (conversation_id, sender_id, message)
      VALUES (?, ?, ?)
    `;

    const [result] = await pool.query(sql, [conversationId, senderId, message]);
    return result;
  }

  async getMessageByIdRepo(messageId) {
    const sql = `
      SELECT
        m.id,
        m.conversation_id AS conversationId,
        m.sender_id AS senderId,
        u.username AS senderUsername,
        m.message,
        m.is_read AS isRead,
        DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
      FROM Messages m
      JOIN Users u ON u.id = m.sender_id
      WHERE m.id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [messageId]);
    return rows[0];
  }

  async getMessagesByConversationIdRepo(conversationId) {
    const sql = `
      SELECT
        m.id,
        m.conversation_id AS conversationId,
        m.sender_id AS senderId,
        u.username AS senderUsername,
        m.message,
        m.is_read AS isRead,
        DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
      FROM Messages m
      JOIN Users u ON u.id = m.sender_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC, m.id ASC
    `;

    const [rows] = await pool.query(sql, [conversationId]);
    return rows;
  }

  // async getVenuesChattingRepo(organizerId) {
  //   const sql = `
  //     SELECT
  //       v.id AS venueId,
  //       v.name AS venueName,
  //       vm.id AS managerId,
  //       u.username AS managerName
  //     FROM Venues v
  //     JOIN VenueManagers vm ON vm.id = v.manager_id
  //     JOIN Users u ON u.id = vm.user_id
  //     ORDER BY v.name ASC
  //   `;

  //   const [rows] = await pool.query(sql);
  //   return rows;
  // }



  async getVenuesChattingRepo(organizerId) {
  const sql = `
    SELECT
      v.id AS venueId,
      v.name AS venueName,
      vm.id AS managerId,
      u.username AS managerName,
      c.id AS conversationId,
      COALESCE(uc.unreadCount, 0) AS unreadCount
    FROM Venues v
    JOIN VenueManagers vm ON vm.id = v.manager_id
    JOIN Users u ON u.id = vm.user_id
    LEFT JOIN Conversations c
      ON c.venue_id = v.id
     AND c.manager_id = vm.id
     AND c.organizer_id = ?
    LEFT JOIN (
      SELECT
        m.conversation_id,
        COUNT(*) AS unreadCount
      FROM Messages m
      JOIN Conversations c2 ON c2.id = m.conversation_id
      JOIN EventOrganizers eo2 ON eo2.id = c2.organizer_id
      JOIN VenueManagers vm2 ON vm2.id = c2.manager_id
      JOIN Users managerUser ON managerUser.id = vm2.user_id
      WHERE c2.organizer_id = ?
        AND m.sender_id = managerUser.id
        AND m.is_read = 0
      GROUP BY m.conversation_id
    ) uc ON uc.conversation_id = c.id
    ORDER BY v.name ASC
  `;

  const [rows] = await pool.query(sql, [organizerId, organizerId]);
  return rows;
}



//   async getOrganizersChattingRepo(managerId) {
//   const sql = `
//     SELECT
//       c.id AS conversationId,
//       eo.id AS organizerId,
//       uo.username AS organizerName,
//       vm.id AS managerId,
//       v.id AS venueId,
//       v.name AS venueName,
//       lm.message AS lastMessagePreview,
//       DATE_FORMAT(lm.created_at, '%Y-%m-%d %H:%i:%s') AS lastMessageAt
//     FROM Conversations c
//     JOIN EventOrganizers eo ON eo.id = c.organizer_id
//     JOIN Users uo ON uo.id = eo.user_id
//     JOIN VenueManagers vm ON vm.id = c.manager_id
//     LEFT JOIN Venues v ON v.id = c.venue_id
//     LEFT JOIN Messages lm ON lm.id = (
//       SELECT m2.id
//       FROM Messages m2
//       WHERE m2.conversation_id = c.id
//       ORDER BY m2.created_at DESC, m2.id DESC
//       LIMIT 1
//     )
//     WHERE c.manager_id = ?
//     ORDER BY lm.created_at DESC, c.created_at DESC
//   `;

//   const [rows] = await pool.query(sql, [managerId]);
//   return rows;
// }



// async getOrganizersChattingRepo(managerId) {
//   const sql = `
//     SELECT
//       c.id AS conversationId,
//       eo.id AS organizerId,
//       uo.username AS organizerName,
//       vm.id AS managerId,
//       v.id AS venueId,
//       v.name AS venueName,
//       lm.message AS lastMessagePreview,
//       DATE_FORMAT(lm.created_at, '%Y-%m-%d %H:%i:%s') AS lastMessageAt,
//       COALESCE(uc.unreadCount, 0) AS unreadCount
//     FROM Conversations c
//     JOIN EventOrganizers eo ON eo.id = c.organizer_id
//     JOIN Users uo ON uo.id = eo.user_id
//     JOIN VenueManagers vm ON vm.id = c.manager_id
//     LEFT JOIN Venues v ON v.id = c.venue_id
//     LEFT JOIN Messages lm ON lm.id = (
//       SELECT m2.id
//       FROM Messages m2
//       WHERE m2.conversation_id = c.id
//       ORDER BY m2.created_at DESC, m2.id DESC
//       LIMIT 1
//     )
//     LEFT JOIN (
//       SELECT
//         m.conversation_id,
//         COUNT(*) AS unreadCount
//       FROM Messages m
//       JOIN Conversations c2 ON c2.id = m.conversation_id
//       JOIN EventOrganizers eo2 ON eo2.id = c2.organizer_id
//       JOIN Users organizerUser ON organizerUser.id = eo2.user_id
//       WHERE c2.manager_id = ?
//         AND m.sender_id = organizerUser.id
//         AND m.is_read = 0
//       GROUP BY m.conversation_id
//     ) uc ON uc.conversation_id = c.id
//     WHERE c.manager_id = ?
//     ORDER BY lm.created_at DESC, c.created_at DESC
//   `;

//   const [rows] = await pool.query(sql, [managerId, managerId]);
//   return rows;
// }






async getOrganizersChattingRepo(managerId) {
  const sql = `
    SELECT
      eo.id AS organizerId,
      uo.username AS organizerName,
      vm.id AS managerId,
      v.id AS venueId,
      v.name AS venueName,

      c.id AS conversationId,

      lm.message AS lastMessagePreview,
      DATE_FORMAT(lm.created_at, '%Y-%m-%d %H:%i:%s') AS lastMessageAt,

      COALESCE(uc.unreadCount, 0) AS unreadCount

    FROM (
      -- DISTINCT organizers per venue per manager
      SELECT DISTINCT
        e.organizer_id,
        va.venue_id
      FROM EventVenueRequests evr
      JOIN Events e ON e.id = evr.event_id
      JOIN VenueAvailability va ON va.id = evr.venue_availability_id
    ) req

    JOIN EventOrganizers eo ON eo.id = req.organizer_id
    JOIN Users uo ON uo.id = eo.user_id
    JOIN Venues v ON v.id = req.venue_id
    JOIN VenueManagers vm ON vm.id = v.manager_id

    LEFT JOIN Conversations c
      ON c.organizer_id = eo.id
     AND c.manager_id = vm.id
     AND c.venue_id = v.id

    LEFT JOIN Messages lm ON lm.id = (
      SELECT m2.id
      FROM Messages m2
      WHERE m2.conversation_id = c.id
      ORDER BY m2.created_at DESC, m2.id DESC
      LIMIT 1
    )

    LEFT JOIN (
      SELECT
        m.conversation_id,
        COUNT(*) AS unreadCount
      FROM Messages m
      JOIN Conversations c2 ON c2.id = m.conversation_id
      JOIN EventOrganizers eo2 ON eo2.id = c2.organizer_id
      JOIN Users organizerUser ON organizerUser.id = eo2.user_id
      WHERE c2.manager_id = ?
        AND m.sender_id = organizerUser.id
        AND m.is_read = 0
      GROUP BY m.conversation_id
    ) uc ON uc.conversation_id = c.id

    WHERE vm.id = ?

    ORDER BY
      CASE WHEN lm.created_at IS NULL THEN 1 ELSE 0 END,
      lm.created_at DESC
  `;

  const [rows] = await pool.query(sql, [managerId, managerId]);
  return rows;
}


async getOrganizerUnreadSummaryRepo(organizerId) {
  const sql = `
    SELECT
      c.id AS conversationId,
      c.venue_id AS venueId,
      c.manager_id AS managerId,
      COUNT(m.id) AS unreadCount
    FROM Conversations c
    JOIN VenueManagers vm ON vm.id = c.manager_id
    JOIN Users managerUser ON managerUser.id = vm.user_id
    LEFT JOIN Messages m
      ON m.conversation_id = c.id
     AND m.sender_id = managerUser.id
     AND m.is_read = 0
    WHERE c.organizer_id = ?
    GROUP BY c.id, c.venue_id, c.manager_id
  `;

  const [rows] = await pool.query(sql, [organizerId]);

  const totalUnread = rows.reduce(
    (sum, row) => sum + Number(row.unreadCount || 0),
    0
  );

  return {
    totalUnread,
    conversations: rows,
  };
}

async getManagerUnreadSummaryRepo(managerId) {
  const sql = `
    SELECT
      c.id AS conversationId,
      c.organizer_id AS organizerId,
      c.venue_id AS venueId,
      COUNT(m.id) AS unreadCount
    FROM Conversations c
    JOIN EventOrganizers eo ON eo.id = c.organizer_id
    JOIN Users organizerUser ON organizerUser.id = eo.user_id
    LEFT JOIN Messages m
      ON m.conversation_id = c.id
     AND m.sender_id = organizerUser.id
     AND m.is_read = 0
    WHERE c.manager_id = ?
    GROUP BY c.id, c.organizer_id, c.venue_id
  `;

  const [rows] = await pool.query(sql, [managerId]);

  const totalUnread = rows.reduce(
    (sum, row) => sum + Number(row.unreadCount || 0),
    0
  );

  return {
    totalUnread,
    conversations: rows,
  };
}




async markConversationReadRepo(payload) {
  const { conversationId, readerUserId } = payload;

  const sql = `
    UPDATE Messages
    SET is_read = 1
    WHERE conversation_id = ?
      AND sender_id <> ?
      AND is_read = 0
  `;

  const [result] = await pool.query(sql, [conversationId, readerUserId]);
  return result;
}





async getReceiverUserIdForMessageRepo(conversationId, senderId) {
  const sql = `
    SELECT
      organizerUser.id AS organizerUserId,
      managerUser.id AS managerUserId
    FROM Conversations c
    JOIN EventOrganizers eo ON eo.id = c.organizer_id
    JOIN Users organizerUser ON organizerUser.id = eo.user_id
    JOIN VenueManagers vm ON vm.id = c.manager_id
    JOIN Users managerUser ON managerUser.id = vm.user_id
    WHERE c.id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [conversationId]);
  const row = rows[0];

  if (!row) return null;

  if (Number(senderId) === Number(row.organizerUserId)) {
    return row.managerUserId;
  }

  if (Number(senderId) === Number(row.managerUserId)) {
    return row.organizerUserId;
  }

  return null;
}

async getUnreadSummaryForUserRepo(userId) {
  const sql = `
    SELECT
      COUNT(m.id) AS totalUnread
    FROM Messages m
    JOIN Conversations c ON c.id = m.conversation_id
    JOIN EventOrganizers eo ON eo.id = c.organizer_id
    JOIN Users organizerUser ON organizerUser.id = eo.user_id
    JOIN VenueManagers vm ON vm.id = c.manager_id
    JOIN Users managerUser ON managerUser.id = vm.user_id
    WHERE m.is_read = 0
      AND m.sender_id <> ?
      AND (
        organizerUser.id = ?
        OR managerUser.id = ?
      )
  `;

  const [rows] = await pool.query(sql, [userId, userId, userId]);

  return {
    totalUnread: Number(rows[0]?.totalUnread || 0),
  };
}









async getConversationParticipantsRepo(conversationId) {
  const sql = `
    SELECT
      c.id AS conversationId,
      organizerUser.id AS organizerUserId,
      organizerUser.username AS organizerUsername,
      managerUser.id AS managerUserId,
      managerUser.username AS managerUsername
    FROM Conversations c
    JOIN EventOrganizers eo ON eo.id = c.organizer_id
    JOIN Users organizerUser ON organizerUser.id = eo.user_id
    JOIN VenueManagers vm ON vm.id = c.manager_id
    JOIN Users managerUser ON managerUser.id = vm.user_id
    WHERE c.id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [conversationId]);
  return rows[0];
}




}

module.exports = MessageRepository;