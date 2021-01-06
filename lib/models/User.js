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

  static async findByEmail({ email }) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    if(!rows[0]) throw new Error(`No user with email ${email} found.`);
    return new User(rows[0]);
  }


};

