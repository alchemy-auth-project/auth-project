const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

let user1;
let user2;
const agent = request.agent(app);
const agent2 = request.agent(app);

describe('gram routes', () => {
  beforeEach(async() => {
    pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
    
    user1 = await UserService.create({
      email: 'test@test.com',
      password: 'password',
      profilePhotoUrl: 'https://www.placecage.com/200/300'
    });

    user2 = await UserService.create({
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
  });

  afterAll(() => {
    return pool.end();
  });

  it('/POST new gram', async() => {
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
      userId: user1.userId,
      photoUrl: 'https://www.fillmurray.com/200/300',
      caption: 'Cool!',
      tags: ['funny', 'snl'],
      gramId: expect.any(String)
    });
  });

  it('/GET all grams', async() => {
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
      userId: user1.userId,
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
    }];

    results.forEach(result => expect(res.body).toContainEqual(result));
  });

  it('/GET one gram by id', async() => {
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
      poster: user1.email,
      photoUrl: gramPosted.body.photoUrl,
      caption: gramPosted.body.caption,
      tags: gramPosted.body.tags,
      gramId: expect.any(String),
      commentData: [
        { 
          comment: commentOne.body.comment,
          comment_id: Number(commentOne.body.commentId),
          comment_email: user1.email
        },
        {
          comment: commentTwo.body.comment,
          comment_id: Number(commentTwo.body.commentId),
          comment_email: user1.email 
        },
        {
          comment: commentThree.body.comment,
          comment_id: Number(commentThree.body.commentId),
          comment_email: user2.email 
        }
      ]
    });
  });

  it('/PATCH update gram by id', async() => {
    const gramPosted = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'What a blast!',
        gramId: gramPosted.body.gramId
      });

    await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'nice!!!!',
        gramId: gramPosted.body.gramId
      });

    const res = await agent
      .patch(`/api/v1/grams/${gramPosted.body.gramId}`)
      .send({
        caption: 'Not fire'
      });

    expect(res.body).toEqual({
      userId: user1.userId,
      photoUrl: gramPosted.body.photoUrl,
      caption: 'Not fire',
      tags: gramPosted.body.tags,
      gramId: gramPosted.body.gramId
    });
  });

  it('/PATCH update gram by id with wrong user', async() => {
    const gramPosted = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'What a blast!',
        gramId: gramPosted.body.gramId
      });

    await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'nice!!!!',
        gramId: gramPosted.body.gramId
      });

    const res = await agent2
      .patch(`/api/v1/grams/${gramPosted.body.gramId}`)
      .send({
        caption: 'Not fire'
      });

    expect(res.body).toEqual({
      message: 'No gram with id 1 is valid for user 2 to update',
      status: 500
    });
  });

  it('/DELETE gram by id and associated comments ', async() => {
    const gramPosted = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'What a blast!',
        gramId: gramPosted.body.gramId
      });

    await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'nice!!!!',
        gramId: gramPosted.body.gramId
      });

    const res = await agent
      .delete(`/api/v1/grams/${gramPosted.body.gramId}`);
      
    expect(res.body).toEqual({
      userId: user1.userId,
      photoUrl: gramPosted.body.photoUrl,
      caption: 'Cool!',
      tags: gramPosted.body.tags,
      gramId: gramPosted.body.gramId
    });
  });

  it('/DELETE gram by id and associated comments with wrong user', async() => {
    const gramPosted = await agent
      .post('/api/v1/grams')
      .send({
        photoUrl: 'https://www.fillmurray.com/200/300',
        caption: 'Cool!',
        tags: ['funny', 'snl']
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'Wow looks fun!',
        gramId: gramPosted.body.gramId
      });

    await agent
      .post('/api/v1/comments')
      .send({
        comment: 'What a blast!',
        gramId: gramPosted.body.gramId
      });

    await agent2
      .post('/api/v1/comments')
      .send({
        comment: 'nice!!!!',
        gramId: gramPosted.body.gramId
      });

    const res = await agent2
      .delete(`/api/v1/grams/${gramPosted.body.gramId}`);
      
    expect(res.body).toEqual({
      message: 'No gram with id 1 is valid for user 2 to delete',
      status: 500
    });
  });
});
