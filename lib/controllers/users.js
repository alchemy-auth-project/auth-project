const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()
  .get('/prolific', (req, res, next) => {
    User
      .prolific()
      .then(users => res.send(users))
      .catch(next);
  });
