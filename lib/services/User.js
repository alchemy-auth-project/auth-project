const pool = require('../utils/pool');

module.exports = class User {
  id;
  email;
  password;


  constructor(row){
    this.id = row.id;
    this.email = row.email;
    this.password = row.password;
  }

  static async insert({ email, password }) {
    const { rows } = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, password]
    );

    return new User(rows[0]);

  }
};

