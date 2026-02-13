const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const testUser = {
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123',
    role: 'customer'
};

const testAdmin = {
    name: 'Test Admin',
    email: `testadmin_${Date.now()}@example.com`,
    password: 'adminpassword123',
    role: 'admin'
};

async function runTests() {
    console.log('Starting API Tests...\n');

    try {
        // 1. Signup Customer
        console.log('1. Testing Customer Signup...');
        const signupRes = await axios.post(`${API_URL}/signup`, testUser);
        if (signupRes.status === 200 && signupRes.data.token && signupRes.data.user.role === 'customer') {
            console.log('✅ Customer Signup Successful');
        } else {
            console.error('❌ Customer Signup Failed', signupRes.data);
        }

        // 2. Signup Admin
        console.log('\n2. Testing Admin Signup...');
        const signupAdminRes = await axios.post(`${API_URL}/signup`, testAdmin);
        if (signupAdminRes.status === 200 && signupAdminRes.data.token && signupAdminRes.data.user.role === 'admin') {
            console.log('✅ Admin Signup Successful');
        } else {
            console.error('❌ Admin Signup Failed', signupAdminRes.data);
        }

        // 3. Login Customer
        console.log('\n3. Testing Customer Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        if (loginRes.status === 200 && loginRes.data.token && loginRes.data.user.role === 'customer') {
            console.log('✅ Customer Login Successful');
        } else {
            console.error('❌ Customer Login Failed', loginRes.data);
        }

        // 4. Login Admin
        console.log('\n4. Testing Admin Login...');
        const loginAdminRes = await axios.post(`${API_URL}/login`, {
            email: testAdmin.email,
            password: testAdmin.password
        });
        if (loginAdminRes.status === 200 && loginAdminRes.data.token && loginAdminRes.data.user.role === 'admin') {
            console.log('✅ Admin Login Successful');
        } else {
            console.error('❌ Admin Login Failed', loginAdminRes.data);
        }

        // 5. Test Duplicate Signup
        console.log('\n5. Testing Duplicate Signup...');
        try {
            await axios.post(`${API_URL}/signup`, testUser);
            console.error('❌ Duplicate Signup Check Failed (Should have thrown error)');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Duplicate Signup Check Successful (Returned 400)');
            } else {
                console.error('❌ Duplicate Signup Check Failed with unexpected error', error.message);
            }
        }

    } catch (error) {
        console.error('❌ An error occurred during testing:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

runTests();
