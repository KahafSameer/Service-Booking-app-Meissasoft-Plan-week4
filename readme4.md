# API Testing Guide (Postman)

This guide provides step-by-step instructions to test the backend API using Postman.

## Prerequisites
- Ensure the backend server is running: `node backend/server.js` or `npm start`.
- Base URL: `http://localhost:5000/api`

## 1. Authentication

### Signup (Customer)
- **Method:** `POST`
- **URL:** `{{BaseURL}}/auth/signup`
- **Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }
  ```
- **Expected:** 200 OK, returns token.

### Signup (Admin)
- **Method:** `POST`
- **URL:** `{{BaseURL}}/auth/signup`
- **Body (JSON):**
  ```json
  {
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "adminpass",
    "role": "admin"
  }
  ```
- **Expected:** 200 OK, returns token.

### Login
- **Method:** `POST`
- **URL:** `{{BaseURL}}/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Expected:** 200 OK, returns token.
- **Action:** Copy the `token` from the response.

## 2. Services (Admin Only)

**Auth Header:** Key: `Authorization`, Value: `Bearer <Admin_Token>`

### Create Service
- **Method:** `POST`
- **URL:** `{{BaseURL}}/services`
- **Body (JSON):**
  ```json
  {
    "category": "DevOps",
    "title": "CI/CD Pipeline Setup",
    "providerName": "Tech Solutions",
    "contactEmail": "contact@tech.com",
    "contactPhone": "1234567890",
    "maxBookings": 5
  }
  ```
- **Expected:** 200 OK, returns service object.
- **Action:** Copy `_id` of the created service.

### Get All Services
- **Method:** `GET`
- **URL:** `{{BaseURL}}/services`
- **Expected:** 200 OK, list of services.

## 3. Bookings

**Auth Header:** Key: `Authorization`, Value: `Bearer <Customer_Token>`

### Create Booking
- **Method:** `POST`
- **URL:** `{{BaseURL}}/booking/<Service_ID>`
- **Expected:** 201 Created.
- **Test Race Condition:** Send multiple concurrent requests to this endpoint (using Postman Collection Runner or similar) to verify `currentBookings` does not exceed `maxBookings`.

### Get My Bookings
- **Method:** `GET`
- **URL:** `{{BaseURL}}/booking/my`
- **Expected:** 200 OK, list of user's bookings.

### Get All Bookings (Admin Only)
- **Method:** `GET`
- **URL:** `{{BaseURL}}/booking`
- **Header:** `Authorization: Bearer <Admin_Token>`
- **Expected:** 200 OK, list of all bookings.

## 4. Dashboard

### Get Dashboard Data
- **Method:** `GET`
- **URL:** `{{BaseURL}}/dashboard/data`
- **Header:** `Authorization: Bearer <Token>`
- **Expected:** 200 OK.
