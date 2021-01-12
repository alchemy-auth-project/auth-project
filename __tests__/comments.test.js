const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

let gramPosted;
const agent = request.agent(app);
const agent2 = request.agent(app);

describe('demo routes', () => {
  beforeEach(async() => {
    pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));

    await UserService.create({
      email: 'test@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });
  
    await UserService.create({
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
  
    await agent2
      .post('/api/v1/auth/login')
      .send({
        email: 'test2@test.com',
        password: 'password2'
      });

    gramPosted = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });
  });

  afterAll(() => {
    return pool.end();
  });

  it('/POST for new comment', async() => {
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
    const commentPosted = await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    const res = await agent
      .delete(`/api/v1/comments/${commentPosted.body.commentId}`);

    expect(res.body).toEqual({
      'message': 'No comment with id 1 is valid for user 1 to delete',
      'status': 500
    });
  });
});
