const pool = require("../config/database");

class ChatBotRepository {

    /**
     * General FAQs
     */
    async getFAQs() {

        try {

            const [rows] = await pool.query(`
                SELECT question, answer
                FROM FAQs
            `);

            return rows;

        } catch (error) {

            console.error("Database Error (FAQs):", error);
            return [];
        }
    }

    /**
     * Event FAQs
     */
    async getEventFAQs() {

        try {

            const [rows] = await pool.query(`
                SELECT question, answer
                FROM EventFAQs
            `);

            return rows;

        } catch (error) {

            console.error("Database Error (Event FAQs):", error);
            return [];
        }
    }

    /**
     * Venue FAQs
     */
    async getVenueFAQs() {

        try {

            const [rows] = await pool.query(`
                SELECT question, answer
                FROM VenueFAQs
            `);

            return rows;

        } catch (error) {

            console.error("Database Error (Venue FAQs):", error);
            return [];
        }
    }

}

module.exports = ChatBotRepository;