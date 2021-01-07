const pool = require('../utils/pool');

module.exports = class Gram {
    gramId;
    photoUrl;
    caption;
    tags;
    userId;

    constructor(row){
        this.gramId = String(row.gram_id);
        this.photoUrl = row.photo_url;
        this.caption = row.caption;
        this.tags = row.tags;
        this.userId = row.user_id;
    }

    static async insert({ photoUrl, caption, tags }, userId) {
        const { rows } = await pool.query(
            'INSERT INTO grams (photo_url, caption, tags, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [photoUrl, caption, tags, userId]
        );
        return new Gram(rows[0]);
    }

    static async find() {
        const { rows } = await pool.query(
            'SELECT * FROM grams'
        );
        return rows.map(row => new Gram(row));
    }
}
