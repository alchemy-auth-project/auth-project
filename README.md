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
4. add verify handle and use ensureAuth middleware



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

* `POST /auth/signup`
  * creates a new user
  * responds with the created user
* `POST /auth/login`
  * responds with a user
* `GET /auth/verify`
  * uses the `ensureAuth` middleware
  * responds with a user

### Posts/Grams

Create RESTful post routes

* `POST /posts`
  * requires authentication
  * creates a new post
  * responds with the new post
  * HINT: get the user who created the post from `req.user`.
* `GET /posts`
  * responds with a list of posts
* `GET /posts/:id`
  * responds with a post by id
  * should include the joined user
  * should include all comments associated with the post (joined with commenter)
* `PATCH /posts/:id`
  * requires authentication
  * only can update the post caption
  * respond with the updated post
  * NOTE: make sure the user attempting to update the post owns it
* `DELETE /posts/:id`
  * requires authentication
  * deletes a post
  * responds with the deleted post
  * NOTE: make sure the user attempting to delete the post owns it
* `GET /posts/popular`
  * respond with a list of the 10 posts with the most comments

### Comments

Create RESTful comments routes

* `POST /comments`
  * requires authentication
  * create a new comment
  * respond with the comment
  * HINT: get the user who created the comment from `req.user`.
* `DELETE /comments/:id`
  * requires authentication
  * delete a comment by id
  * respond with the deleted comment
  * NOTE: make sure the user attempting to delete the comment owns it

### Users

* BONUS:
  * `GET /users/popular`
    * respond with the 10 users with the most total comments on their posts
  * `GET /users/prolific`
    * respond with the 10 users with the most posts
  * `GET /users/leader`
    * respond with the 10 users with the most comments
  * `GET /users/impact`
    * respond with the 10 users with the highest `$avg` comments per post

## Rubric

* User model - 4 points
* Auth routes - 4 points
* Post setup (routes and model) 5 points
* Comment setup (routes and model) 5 points
* Aggregations - 2 points (1 point per aggregation)