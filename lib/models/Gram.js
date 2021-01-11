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

    static async findById(id) {
      const { rows } = await pool.query(
        `SELECT
            grams.gram_id,
            photo_url,
            caption, 
            grams.tags,
            users.email AS poster,
            json_agg(json_build_object('comment_id', comment_id, 'comment', comment, 'comment_email', users2.email) ORDER BY comment_id) AS comment_data
        FROM grams
        JOIN comments
        ON comments.gram_id = grams.gram_id
        JOIN users
        ON users.user_id = grams.user_id
        JOIN users AS users2
        ON users2.user_id = comments.user_id
        WHERE grams.gram_id=$1
        GROUP BY 
            grams.gram_id,
            photo_url,
            caption, 
            grams.tags,
            poster
        `,
        [id]
      );
      if(!rows[0]) throw new Error(`Gram with id ${id} not found`);
      else 
        return {
          poster: rows[0].poster,
          photoUrl: rows[0].photo_url,
          caption: rows[0].caption,
          tags: rows[0].tags,
          gramId: rows[0].gram_id,
          commentData: rows[0].comment_data
        };


    }

    static async update(id, caption, userId) {
      const { rows } = await pool.query(
        `UPDATE 
          grams
        SET 
          caption=$1
        WHERE 
          gram_id=$2
        AND
          user_id=$3
        RETURNING *`,
        [caption, id, userId]
      );

      if(!rows[0]) throw new Error(`No gram with id ${id} is valid for user ${userId} to update`);

      return new Gram(rows[0]);
    }

    static async delete(id, userId) {
      const client = await pool.connect();

      await client.query(
        'BEGIN;'
      );

      const { rows } = await client.query(
        `DELETE FROM grams
        WHERE
          gram_id=$1
        AND
          user_id=$2
        RETURNING *;`,
        [id, userId]
      );
      await client.query(
        'COMMIT;'
      );  

      client.release();

      if(!rows[0]) throw new Error(`No gram with id ${id} is valid for user ${userId} to delete`);
      
      return new Gram(rows[0]);
    }

    static async popular() {

      const { rows } = await pool.query(
        `SELECT
          grams.gram_id,
          grams.photo_url,
          grams.caption,
          grams.tags,
          grams.user_id,
          count(comment_id)
          
          FROM grams
          LEFT JOIN
          comments
          ON grams.gram_id = comments.gram_id
          GROUP BY grams.gram_id
          ORDER BY count desc
          LIMIT 10`
      );

      return rows.map(row => {
        const result = { ...row };
        delete result.count;
        return new Gram(result);
      });
    }

};
