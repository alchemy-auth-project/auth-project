const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('demo routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  afterAll(() => {
    return pool.end();
  });

  it('allows a user to signup via POST', async() => {
   
    const res = await request(app)
      .post('/api/v1/auth/signup') //setup post route
      .send({ email: 'test@test.com', password: 'password' });

    expect(res.body).toEqual({
      id: expect.any(String),
      email: 'test@test.com',
      password: 'password'
    });

  });


  it('allows user to login', async() => {

    await User.insert({
      email: 'test@test.com',
      password: 'password'
    });

    const user = await User.findByEmail({
      email: 'test@test.com',
      password: 'password'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      });

    expect(res.body).toEqual(user);

  });
});
