const pool = require('../utils/pool');
const Comment = require('./Comment');


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
          grams.user_id AS poster,
          comment_id,
          comment,
          comments.user_id AS commenter,
          users.email AS poster_email,
          users2.email AS commenter_email
                FROM grams
                JOIN comments
                ON comments.gram_id = grams.gram_id
            JOIN users
                ON users.user_id = grams.user_id
            JOIN users AS users2
            ON users2.user_id = comments.user_id
                WHERE grams.gram_id=$1
        `,
        [id]
      );
      console.log(rows);
      if(!rows[0]) throw new Error(`Gram with id ${id} not found`);
      else return {
        ...new Gram(rows[0]),
        comments: rows[0].comment.map(comment => new Comment(comment))
      };
    }
};


