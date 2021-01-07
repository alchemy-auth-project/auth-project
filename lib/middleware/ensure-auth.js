const UserService = require('../services/UserService');

module.exports = (req, res, next) => {
  console.log(req.cookies);
  try {
    const token = req.cookies.session;
    req.user = UserService.verifyAuthToken(token);
    next();
  } catch(err) {
    err.status = 401;
    next(err);
  }
};
