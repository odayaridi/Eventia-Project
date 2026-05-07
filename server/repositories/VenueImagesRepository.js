const pool = require("../config/database");

class VenueImagesRepository {

    // =========================
    // INSERT IMAGES
    // =========================
    async insertVenueImages(venueId, images) {

        const values = images.map(img => [venueId, img]);

        const sql = `
            INSERT INTO VenueImages (venue_id, image_url)
            VALUES ?
        `;

        await pool.query(sql, [values]);
    }

    // =========================
    // GET IMAGES
    // =========================
    async getImagesByVenueId(venueId) {

        const sql = `
            SELECT image_url
            FROM VenueImages
            WHERE venue_id = ?
        `;

        const [rows] = await pool.query(sql, [venueId]);
        return rows;
    }

    // =========================
    // DELETE OLD IMAGES
    // =========================
    async deleteByVenueId(venueId) {

        const sql = `DELETE FROM VenueImages WHERE venue_id = ?`;
        await pool.query(sql, [venueId]);
    }
}

module.exports = VenueImagesRepository;