const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

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
      .send({ email: 'test@test.com', password: 'password', profilePhotoUrl: 'https://www.placecage.com/200/300' });

    expect(res.body).toEqual({
      userId: expect.any(String),
      email: 'test@test.com',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

  });


  it('allows user to login', async() => {
    const user = await UserService.create({
      email: 'test@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      });

    expect(res.body).toEqual({
      userId: user.userId,
      email: 'test@test.com',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

  });

  it('verifies a user is logged in', async() => {
    const agent = request.agent(app);
    const user = await UserService.create({
      email: 'test@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

    await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      });

    const res = await agent 
      .get('/api/v1/auth/verify');

    expect(res.body).toEqual({
      userId: user.userId,
      email: 'test@test.com',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });
  });

  it('/POST for new gram', async() => {
    const agent = request.agent(app);
    const user = await UserService.create({
      email: 'test@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

    await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      });

    const res = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    expect(res.body).toEqual({
      userId: user.userId,
      photoUrl: 'https://www.fillmurray.com/200/300',
      caption: 'Cool!',
      tags: ['funny', 'snl'],
      gramId: expect.any(String)
    });
  });

  it('/GET a list of grams', async() => {
    const agent = request.agent(app);
    const agent2 = request.agent(app);
    
    const user = await UserService.create({
      email: 'test@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

    const user2 = await UserService.create({
      email: 'test2@test.com',
      password: 'password2',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

    await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      });

    await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    await agent2
      .post('/api/v1/auth/login')
      .send({
        email: 'test2@test.com',
        password: 'password2'
      });

    await agent2
    .post('/api/v1/grams')
    .send({
      photoUrl: 'https://www.placekitten.com/200/300',
      caption: 'So fluff',
      tags: ['cat', 'smol']
    });

    const res = await request(app)
      .get('/api/v1/grams');

    const results = [{
        userId: user.userId,
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl'],
        gramId: "1"
      },
      {
        userId: user2.userId,
        photoUrl: 'https://www.placekitten.com/200/300',
        caption: 'So fluff',
        tags: ['cat', 'smol'],
        gramId: "2"
      }
    ];

    results.forEach(result => expect(res.body).toContainEqual(result));
  });
});
