# Postman API Testing Guide

This guide provides step-by-step instructions on how to test the Booking System API using Postman.

## Prerequisites
- Ensure the backend server is running:
  ```bash
  cd backend
  node server.js
  ```
  The server should be running on `http://localhost:5000`.

---

## 1. Signup (Customer)
Create a new standard user account.

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/signup`
- **Body:** Select **raw** > **JSON**
  ```json
  {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123",
      "role": "customer"
  }
  ```
- **Expected Response (200 OK):**
  ```json
  {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
          "id": "65cb...",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "customer"
      }
  }
  ```

---

## 2. Signup (Admin)
Create a new admin account.

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/signup`
- **Body:** Select **raw** > **JSON**
  ```json
  {
      "name": "Admin User",
      "email": "admin@example.com",
      "password": "adminpassword",
      "role": "admin"
  }
  ```
- **Expected Response (200 OK):**
  ```json
  {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
          "id": "65cb...",
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "admin"
      }
  }
  ```

---

## 3. Login
Log in to receive an authentication token.

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Body:** Select **raw** > **JSON**
  ```json
  {
      "email": "admin@example.com",
      "password": "adminpassword"
  }
  ```
- **Expected Response (200 OK):**
  ```json
  {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
          "id": "65cb...",
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "admin"
      }
  }
  ```
  **Important:** Copy the `token` string from this response. You will need it for the next steps.

---

## 4. Create Service (Admin Only)
Create a new booking service. **Requires Admin Token.**

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/services`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer <YOUR_ADMIN_TOKEN_HERE>`
- **Body:** Select **raw** > **JSON**
  ```json
  {
      "category": "DevOps",
      "title": "CI/CD Pipeline Setup",
      "providerName": "Tech Solutions Inc.",
      "contactEmail": "contact@techsolutions.com",
      "contactPhone": "123-456-7890",
      "maxBookings": 10
  }
  ```
- **Valid Categories:** `DevOps`, `DevSecOps`, `MLOps`, `Cloud Infrastructure`, `CI/CD Automation`, `Containerization`, `Kubernetes Management`, `Monitoring & Logging`, `Security & Compliance`

- **Expected Response (200 OK):**
  ```json
  {
      "category": "DevOps",
      "title": "CI/CD Pipeline Setup",
      "...": "...",
      "_id": "65cb...",
      "createdAt": "2024-02-15T..."
  }
  ```

---

## 5. Access Dashboard (Protected Route)
Access a route that requires a valid token.

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/data`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer <YOUR_TOKEN_HERE>`
- **Expected Response (200 OK):**
  ```json
  {
      "message": "welcome user 65cb..."
  }
  ```
