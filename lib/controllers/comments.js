const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth');
const Comment = require('../models/Comment');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    Comment
      .insert(req.body, req.user.userId)
      .then(comment => res.send(comment))
      .catch(next);
  })

  .delete('/:id', ensureAuth, (req, res, next) => {
    Comment
      .remove(req.params.id, req.user.userId)
      .then(comment => res.send(comment))
      .catch(next);
  });

