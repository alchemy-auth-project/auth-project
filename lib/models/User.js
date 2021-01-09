const pool = require('../utils/pool');

module.exports = class User {
  userId;
  email;
  passwordHash;
  profilePhotoUrl;

  constructor(row){
    this.userId = String(row.user_id);
    this.email = row.email;
    this.passwordHash = row.password_hash;
    this.profilePhotoUrl = row.profile_photo_url;
  }

  static async insert({ email, passwordHash, profilePhotoUrl }) {
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, profile_photo_url) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, profilePhotoUrl]
    );
    return new User(rows[0]);
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    if(!rows[0]) throw new Error(`No user with email ${email} found.`);
    return new User(rows[0]);
  }

  static async prolific() {
    const { rows } = await pool.query(
      `SELECT
      users.user_id,
      email,
      profile_photo_url,
      COUNT(gram_id)
      
      FROM users
      INNER JOIN grams
      ON grams.user_id = users.user_id
      GROUP BY users.user_id
      ORDER BY count DESC
      `
    );
    
    return rows.map(row => {
      const result = { ...row };
      delete result.count;
      return new User(result);
    });
  }

  toJSON() {
    const json = { ...this };
    delete json.passwordHash;
    return json;
  }
};

