# Backend Fixes and Improvements

This document details the analysis and fixes applied to the backend code to address logic errors, race conditions, and validation gaps.

## 1. Booking System Race Condition

**Issue:**
The original booking logic read the `currentBookings` count, checked it against `maxBookings`, and then saved the new booking and updated the count in separate operations. This created a race condition where concurrent requests could overshoot the maximum booking limit.

**Fix:**
- Modified `backend/routes/bookingRoutes.js`.
- Implemented `findOneAndUpdate` with a query condition `{ $lt: ["$currentBookings", "$maxBookings"] }`.
- This ensures the check and increment happen atomically in the database.

## 2. User ID Access Bug

**Issue:**
The `auth.js` middleware attaches the decoded token payload to `req.user`. The payload contains `{ id: ..., role: ... }`. However, `bookingRoutes.js` was trying to access `req.user._id`, which was `undefined`, causing booking creation to fail or save with a null user ID.

**Fix:**
- Updated `backend/routes/bookingRoutes.js` to use `req.user.id`.

## 3. Input Validation

**Issue:**
The API lacked input validation, allowing:
- Users to signup with empty fields or invalid emails.
- Services to be created without required fields.

**Fix:**
- Updated `backend/routes/authRoutes.js`:
    - Added checks for `name`, `email`, `password`.
    - Enforced minimum password length of 6 characters.
    - Added regex validation for email format.
- Updated `backend/routes/serviceRoutes.js`:
    - Added checks for `category`, `title`, `providerName`, `contactEmail`, `contactPhone`.

## 4. Error Handling

**Issue:**
Generic error messages were often returned.

**Fix:**
- improved error messages in `authRoutes.js` and `serviceRoutes.js` to be more descriptive (e.g., "Invalid email format", "Password must be at least 6 characters").

## Summary of Modified Files

- `backend/routes/bookingRoutes.js`: Fixed race condition and User ID bug.
- `backend/routes/authRoutes.js`: Added input validation.
- `backend/routes/serviceRoutes.js`: Added input validation.
