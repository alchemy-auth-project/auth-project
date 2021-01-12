const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');

describe('gram routes', () => {
  beforeEach(async() => {
    await pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
    return pool.query(fs.readFileSync('./sql/seedData.sql', 'utf-8'));
  });

  afterAll(() => {
    return pool.end();
  });

  it('/GET ten grams with most comments', async() => {
    const res = await request(app)
      .get('/api/v1/grams/popular');

    expect(res.body).toEqual(require('./popularResults.json'));
  });

  it('/GET ten users with most grams', async() => {
    const res = await request(app)
      .get('/api/v1/users/prolific');

    expect(res.body).toEqual(require('./prolificResults.json'));
  });
});
