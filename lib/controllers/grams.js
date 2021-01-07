const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth');
const UserService = require('../services/UserService');
const Gram = require('../models/Gram');

module.exports = Router()
    .post('/', ensureAuth, (req, res, next) => {
        Gram
            .insert(req.body, req.user.userId)
            .then(gram => res.send(gram))
            .catch(next)
    })

    .get('/', (req, res, next) => {
        Gram
            .find()
            .then(grams => res.send(grams))
            .catch(next)
    });
