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
      gramId: expect.any(String)
    },
    {
      userId: user2.userId,
      photoUrl: 'https://www.placekitten.com/200/300',
      caption: 'So fluff',
      tags: ['cat', 'smol'],
      gramId: expect.any(String)
    }
    ];

    results.forEach(result => expect(res.body).toContainEqual(result));
  });

  it('/POST for new comment', async() => {
    const agent = request.agent(app);
    await UserService.create({
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

    const gramPosted = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    const res = await agent
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    expect(res.body).toEqual({
      commentId: expect.any(String),
      comment: 'Wow looks fun!',
      userId: expect.any(String),
      gramId: gramPosted.body.gramId
    });
  });

  it('/DELETE comment by id', async() => {
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

    const gramPosted = await agent
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

    const commentPosted = await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    const res = await agent2
      .delete(`/api/v1/comments/${commentPosted.body.commentId}`);

    expect(res.body).toEqual(commentPosted.body);

  });

  it('/DELETE user 1 tries to delete user 2 comment', async() => {
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

    const gramPosted = await agent
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

    const commentPosted = await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    const res = await agent
      .delete(`/api/v1/comments/${commentPosted.body.commentId}`);

    expect(res.body).toEqual({
      'message': 'No comment with id 1 is valid user 1 to delete',
      'status': 500
    });

  });


  it('/GET one gram via id', async() => {
    const agent = request.agent(app);
    const agent2 = request.agent(app);
    
    const user = await UserService.create({
      email: 'test@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

    const user2 = await UserService.create({
      email: 'test2@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });


    await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      });

    await agent2
      .post('/api/v1/auth/login')
      .send({
        email: 'test2@test.com',
        password: 'password'
      });

    const gramPosted = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    const commentOne = await agent
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    const commentTwo = await agent
      .post('/api/v1/comments')
      .send({
        comment: 'What a blast!',
        gramId: gramPosted.body.gramId
      });

    const commentThree = await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'nice!!!!',
        gramId: gramPosted.body.gramId
      });

    const res = await request(app)
      .get(`/api/v1/grams/${gramPosted.body.gramId}`);

    expect(res.body).toEqual({
      userId: user.userId,
      photoUrl: 'https://www.fillmurray.com/200/300',
      caption: 'Cool!',
      tags: ['funny', 'snl'],
      gramId: expect.any(String),
      comments: [[commentOne.body.comment, user.userId], [commentTwo.body.comment, user.userId], [commentThree.body.comment, user.userId]]
    });
  });
});
