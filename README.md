# Make Your Tour - API
## Introduction
Welcome to the **"Make Your Tour"** API documentation! This API allows users to interact with a tour management system. It supports user authentication, tour management, review handling, and more.

## API Base URL
All API endpoints are prefixed with `/api/v1`. For example, to access the users' endpoints, use `/api/v1/users`.

## Security Features
- **Helmet**: Secures HTTP headers to help protect from common vulnerabilities.
- **Rate Limiting**: Limits the number of requests to prevent abuse (100 requests per hour).
- **Input Sanitization**: Uses `express-mongo-sanitize` to prevent NoSQL injection and `xss-clean` to prevent XSS attacks.
- **HPP**: Ensures no HTTP parameter pollution by only allowing specific query parameters.

## Routes Overview

### 1. User Routes (`/api/v1/users`)

#### `POST /signup`
- **Description**: Creates a new user account.
- **Body**: `{ "name": "John Doe", "email": "johndoe@example.com", "password": "password123", "passwordConfirm": "password123" }`
  
#### `POST /login`
- **Description**: Logs in a user and returns a JWT token.
- **Body**: `{ "email": "johndoe@example.com", "password": "password123" }`
  
#### `POST /forgotpassword`
- **Description**: Requests a password reset link for the user.
- **Body**: `{ "email": "johndoe@example.com" }`
  
#### `PATCH /resetpassword/:token`
- **Description**: Resets the password using a token.
- **Body**: `{ "password": "newpassword123", "passwordConfirm": "newpassword123" }`
  
#### `PATCH /updatepassword/:id`
- **Description**: Updates the password of a user.
- **Authorization**: Requires user to be logged in.

#### `GET /me`
- **Description**: Returns the currently logged-in user’s data.

#### `PATCH /updateme`
- **Description**: Allows a logged-in user to update their personal data (e.g., name, email).
  
#### `DELETE /deleteme`
- **Description**: Deletes the logged-in user's account.

#### Admin Routes (Requires Admin role):
  
#### `GET /`
- **Description**: Retrieves all users.
  
#### `POST /`
- **Description**: Creates a new user (only accessible to admin).
  
#### `GET /:id`
- **Description**: Retrieves a specific user by ID.

#### `PATCH /:id`
- **Description**: Updates a specific user's data.

#### `DELETE /:id`
- **Description**: Deletes a specific user by ID.

### 2. Tour Routes (`/api/v1/tours`)

#### `GET /`
- **Description**: Retrieves all tours.

#### `POST /`
- **Description**: Creates a new tour.
- **Authorization**: Requires `ADMIN` or `LEAD_GUIDE` role.

#### `GET /top-5-cheap`
- **Description**: Retrieves the top 5 cheapest tours.

#### `GET /tour-stats`
- **Description**: Retrieves statistical data on tours, like average ratings, most popular tours, etc.

#### `GET /monthly-plans/:year`
- **Description**: Retrieves monthly plans for tours of a specific year.
- **Authorization**: Requires `ADMIN`, `GUIDE`, or `LEAD_GUIDE` role.

#### `GET /:id`
- **Description**: Retrieves a specific tour by ID.

#### `PATCH /:id`
- **Description**: Updates a specific tour by ID.
- **Authorization**: Requires `ADMIN` or `LEAD_GUIDE` role.

#### `DELETE /:id`
- **Description**: Deletes a specific tour by ID.
- **Authorization**: Requires `ADMIN` or `LEAD_GUIDE` role.

#### `GET /tours-within/:distance/centre/:latlong/unit/:unit`
- **Description**: Retrieves tours within a specific distance from a given point.

#### `GET /distances/:latlong/unit/:unit`
- **Description**: Calculates the distance of tours from a given point.

### 3. Review Routes (`/api/v1/reviews`)

#### `POST /:tourId/reviews`
- **Description**: Creates a new review for a tour.
- **Body**: `{ "rating": 4.5, "review": "Excellent tour!" }`

#### `GET /:tourId/reviews`
- **Description**: Retrieves all reviews for a specific tour.

## Authentication Middleware
- **Protect**: Ensures that the user is authenticated and has a valid token.
- **RestrictTo**: Restricts access to certain roles such as `admin`, `guide`, or `lead-guide`.

## Error Handling
- **Global Error Handler**: A global error handler is set up to catch all errors and send a proper response to the client.
- **Custom Errors**: If an invalid URL is requested, a custom error is thrown.
