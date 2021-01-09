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
      'message': 'No comment with id 1 is valid for user 1 to delete',
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
      poster: user.email,
      photoUrl: gramPosted.body.photoUrl,
      caption: gramPosted.body.caption,
      tags: gramPosted.body.tags,
      gramId: expect.any(String),
      commentData: [
        { 
          comment: commentOne.body.comment,
          comment_id: Number(commentOne.body.commentId),
          comment_email: user.email
        },
        {
          comment: commentTwo.body.comment,
          comment_id: Number(commentTwo.body.commentId),
          comment_email: user.email 
        },
        {
          comment: commentThree.body.comment,
          comment_id: Number(commentThree.body.commentId),
          comment_email: user2.email 
        }
      ]
    });
  });

  it('/PATCH /grams/:id', async() => {
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

    const res = await agent
      .patch(`/api/v1/grams/${gramPosted.body.gramId}`)
      .send({
        caption: 'Not fire'
      })

    expect(res.body).toEqual({
      userId: user.userId,
      photoUrl: gramPosted.body.photoUrl,
      caption: 'Not fire',
      tags: gramPosted.body.tags,
      gramId: gramPosted.body.gramId
    });
  });

  it('/PATCH /grams/:id fail condition wrong user', async() => {
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

    const res = await agent2
      .patch(`/api/v1/grams/${gramPosted.body.gramId}`)
      .send({
        caption: 'Not fire'
      })

    expect(res.body).toEqual({
      message: 'No gram with id 1 is valid for user 2 to update',
      status: 500
    });
  });

  it('/DELETE /grams/:id ', async() => {
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

    const res = await agent
      .delete(`/api/v1/grams/${gramPosted.body.gramId}`)
      
    expect(res.body).toEqual({
      userId: user.userId,
      photoUrl: gramPosted.body.photoUrl,
      caption: 'Cool!',
      tags: gramPosted.body.tags,
      gramId: gramPosted.body.gramId
    });
  });

  it('/DELETE with wrong user, verify error message', async() => {
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

    const res = await agent2
      .delete(`/api/v1/grams/${gramPosted.body.gramId}`)
      
    expect(res.body).toEqual({
      message: 'No gram with id 1 is valid for user 2 to delete',
      status: 500
    });
  });

  it('/GET the 10 grams with most comments', async() => {

    await pool.query(fs.readFileSync('./sql/test.sql', 'utf-8'));
    const res = await request(app)
      .get('/api/v1/grams/popular');

    expect(res.body).toEqual(require('./expectedResults.json'));

  });

  it('/GET the 10 users with most grams', async() => {

    await pool.query(fs.readFileSync('./sql/userTest.sql', 'utf-8'));
    const res = await request(app)
      .get('/api/v1/users/prolific');

    expect(res.body).toEqual(require('./prolificResults.json'));

  });

});
