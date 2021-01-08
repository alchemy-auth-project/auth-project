const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth');
const Gram = require('../models/Gram');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    Gram
      .insert(req.body, req.user.userId)
      .then(gram => res.send(gram))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Gram
      .find()
      .then(grams => res.send(grams))
      .catch(next);
  })

  .get('/popular', (req, res, next) => {
    Gram
      .popular()
      .then(gram => res.send(gram))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Gram
      .findById(req.params.id)
      .then(gram => res.send(gram))
      .catch(next);
  })

  .patch('/:id', ensureAuth, (req, res, next) => {
    Gram
      .update(req.params.id, req.body.caption, req.user.userId)
      .then(gram => res.send(gram))
      .catch(next);
  })

  .delete('/:id', ensureAuth, (req, res, next) => {
    Gram
      .delete(req.params.id, req.user.userId)
      .then(gram => res.send(gram))
      .catch(next);
  });


