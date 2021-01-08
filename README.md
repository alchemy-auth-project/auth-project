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
5. auth controller and signup handler x
6. add authToken method to UserService x
7. attach cookie on signup x

### Login

1. login route test x
2. add findByEmail to User model x
3. add authorize to UserService (use findByEmail and bcrypt.compare password) x
4. add login handler to auth controller x
5. attach cookie on login x

### Verify

1. verify route test x
2. add verify token in UserService x
3. add ensure auth middleware (get session cookie from req.cookies, verify token with UserService, attach user to req.user) x
4. add verify handle and use ensureAuth middleware x



# Tardygram (Instagram clone)

Let's create an Instagram clone.

## Models

### User

Users can post new posts and leave comments. They have:

* A String `username` 
* A String `password_hash` 
* A String `profile_photo_url` 

### Post/Gram

Posts are photos with some text caption. They should have:

* A reference to user `user` 
* A String `photo_url` 
* A String `caption` 
* An array of String `tags` 

### Comment

Comments have:

* A reference to a user `comment_by` 
* A reference to a post `post` 
* A string `comment` 

## Routes

### Auth

Create authentication routes

* `POST /auth/signup` x
  * creates a new user x
  * responds with the created user x
* `POST /auth/login` x
  * responds with a user x
* `GET /auth/verify` x
  * uses the `ensureAuth` middleware x
  * responds with a user x

### Posts/Grams

Create RESTful post routes

* `POST /grams` x
  * requires authentication
  * creates a new gram
  * responds with the new gram
  * HINT: get the user who created the gram from `req.user`.
* `GET /grams` x
  * responds with a list of grams
* `GET /grams/:id` x
  * responds with a gram by id
  * should include the joined user
  * should include all comments associated with the gram (joined with commenter)
* `PATCH /grams/:id` x
  * requires authentication
  * only can update the gram caption
  * respond with the updated gram
  * NOTE: make sure the user attempting to update the gram owns it
* `DELETE /grams/:id` x
  * requires authentication
  * deletes a gram
  * responds with the deleted gram
  * NOTE: make sure the user attempting to delete the gram owns it
  * Added: also delete the comments
* `GET /grams/popular` x
  * respond with a list of the 10 grams with the most comments

### Comments

Create RESTful comments routes

* `POST /comments` x
  * requires authentication
  * create a new comment
  * respond with the comment
  * HINT: get the user who created the comment from `req.user`.
* `DELETE /comments/:id` x
  * requires authentication
  * delete a comment by id
  * respond with the deleted comment
  * NOTE: make sure the user attempting to delete the comment owns it

### Users

* BONUS:
  * `GET /users/popular`
    * respond with the 10 users with the most total comments on their grams
  * `GET /users/prolific`
    * respond with the 10 users with the most grams
  * `GET /users/leader`
    * respond with the 10 users with the most comments
  * `GET /users/impact`
    * respond with the 10 users with the highest `$avg` comments per gram

## Rubric

* User model - 4 points
* Auth routes - 4 points
* Post setup (routes and model) 5 points
* Comment setup (routes and model) 5 points
* Aggregations - 2 points (1 point per aggregation)
