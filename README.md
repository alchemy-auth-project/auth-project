# auth-project

# Auth

* Signup
  * test with plain text password
    * create model
    * select from table
  * use md5 to hash password
    * create service
    * rainbow table
  * bcrypt
    * hash
    * compare
    * salt
    * parts
  * use bcrypt to select password
* Login
* Verify
  * jwt
  * use cookie on signup and login
  * ensure auth middleware

## Steps

* install cookie-parser, bcryptjs, jsonwebtoken

### Signup

1. signup route test x
2. create user table (setup.sql) x
3. create User model and insert method x
4. create UserService and create method (use bcrypt to hash password) x
5. auth controller and signup handler
6. add authToken method to UserService
7. attach cookie on signup

### Login

1. login route test x
2. add findByEmail to User model x
3. add authorize to UserService (use findByEmail and bcrypt.compare password)
4. add login handler to auth controller
5. attach cookie on login

### Verify

1. verify route test
2. add verify token in UserService
3. add ensure auth middleware (get session cookie from req.cookies, verify token with UserService, attach user to req.user)
4. add verify handle and use ensureAuth middleware
