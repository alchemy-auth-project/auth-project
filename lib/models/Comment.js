const pool = require('../utils/pool');

module.exports = class Comment {
    commentId;
    comment;
    userId;
    gramId;

    constructor(row){
      this.commentId = String(row.comment_id);
      this.comment = row.comment;
      this.userId = String(row.user_id);
      this.gramId = String(row.gram_id);
    }

    static async insert({ comment, gramId }, userId) {
      const { rows } = await pool.query(
        'INSERT INTO comments (comment, gram_id, user_id) VALUES ($1, $2, $3) RETURNING *',
        [comment, gramId, userId]
      );
      return new Comment(rows[0]);
    }

    static async remove(commentId, userId) {
      const { rows } = await pool.query(
        'DELETE FROM comments WHERE comment_id = $1 AND user_id = $2 RETURNING *',
        [commentId, userId]
      );

      if(!rows[0]) throw new Error(`No comment with id ${commentId} is valid for user ${userId} to delete`);

      return new Comment(rows[0]);
    }

};
