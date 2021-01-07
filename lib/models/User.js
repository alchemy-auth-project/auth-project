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

  toJSON() {
    const json = { ...this };
    delete json.passwordHash;
    return json;
  }
};

