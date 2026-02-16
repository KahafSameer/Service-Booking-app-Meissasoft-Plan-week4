const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const AUTH_URL = `${API_URL}/auth`;
const SERVICES_URL = `${API_URL}/services`;
const BOOKING_URL = `${API_URL}/booking`;

const runTests = async () => {
    try {
        console.log('--- Starting Verification ---');

        // 1. Auth Validation Tests
        console.log('\n--- 1. Testing Auth Validation ---');
        try {
            await axios.post(`${AUTH_URL}/signup`, {
                name: 'Bad User',
                email: 'bademail', // Invalid email
                password: '123' // Short password
            });
            console.error('❌ Auth Validation Failed: Should have rejected invalid email/password');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Auth Validation Passed (400 Bad Request received)');
            } else {
                console.error('❌ Auth Validation Error:', err.message);
            }
        }

        // 2. Valid Signup/Login
        console.log('\n--- 2. Testing Valid Auth ---');
        const adminEmail = `admin_${Date.now()}@test.com`;
        const userEmail = `user_${Date.now()}@test.com`;
        const password = 'password123';

        // Signup Admin
        const adminSignup = await axios.post(`${AUTH_URL}/signup`, {
            name: 'Admin',
            email: adminEmail,
            password: password,
            role: 'admin'
        });
        const adminToken = adminSignup.data.token;
        console.log('✅ Admin Signup & Login Success');

        // Signup User
        const userSignup = await axios.post(`${AUTH_URL}/signup`, {
            name: 'User',
            email: userEmail,
            password: password,
            role: 'customer'
        });
        const userToken = userSignup.data.token;
        console.log('✅ User Signup & Login Success');

        // 3. Service Creation Validation
        console.log('\n--- 3. Testing Service Creation ---');
        try {
            await axios.post(SERVICES_URL, {}, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.error('❌ Service Validation Failed: Should have rejected empty body');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Service Validation Passed (400 Bad Request received)');
            }
        }

        const uniqueTitle = `Service ${Date.now()}`;
        const serviceRes = await axios.post(SERVICES_URL, {
            category: 'DevOps',
            title: uniqueTitle,
            providerName: 'Test Provider',
            contactEmail: 'test@provider.com',
            contactPhone: '1234567890',
            maxBookings: 2 // Small number for race condition test
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const serviceId = serviceRes.data._id;
        console.log(`✅ Service Created: ${serviceId}`);

        // 4. Booking Race Condition Test
        console.log('\n--- 4. Testing Booking Race Condition ---');
        // Try to book 5 times concurrently (max is 2)
        const bookingPromises = [];
        for (let i = 0; i < 5; i++) {
            bookingPromises.push(
                axios.post(`${BOOKING_URL}/${serviceId}`, {}, {
                    headers: { Authorization: `Bearer ${userToken}` }
                }).then(res => ({ status: res.status, data: res.data }))
                    .catch(err => ({ status: err.response?.status, data: err.response?.data }))
            );
        }

        const results = await Promise.all(bookingPromises);
        const successCount = results.filter(r => r.status === 201).length;
        const failCount = results.filter(r => r.status === 400).length;

        console.log(`Attempted 5 bookings for service with maxBookings=2`);
        console.log(`Successes: ${successCount}`);
        console.log(`Failures: ${failCount}`);

        if (successCount <= 2) {
            console.log('✅ Race Condition Handled: Did not overbook.');
        } else {
            console.error('❌ Race Condition FAILED: Overbooked!');
        }

        // 5. Verify Final Count
        const metricsRes = await axios.get(SERVICES_URL);
        const updatedService = metricsRes.data.find(s => s._id === serviceId);
        console.log(`Final Current Bookings in DB: ${updatedService.currentBookings}`);

        if (updatedService.currentBookings === successCount) {
            console.log('✅ Database count matches successful bookings.');
        } else {
            console.error('❌ Database count mismatch!');
        }

    } catch (err) {
        console.error('❌ Global Test Error:', err.message);
        if (err.response) console.error(err.response.data);
    }
};

runTests();
