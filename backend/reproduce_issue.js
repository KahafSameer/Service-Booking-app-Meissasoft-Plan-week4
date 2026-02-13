// const axios = require('axios');

// const API_URL = 'http://localhost:5000/api';
// const AUTH_URL = `${API_URL}/auth`;
// const SERVICES_URL = `${API_URL}/services`;

// const testAdmin = {
//     name: 'Service Admin',
//     email: `service_admin_${Date.now()}@example.com`,
//     password: 'adminpassword123',
//     role: 'admin'
// };

// const validService = {
//     category: "DevOps",
//     title: "CI/CD Pipeline Setup",
//     providerName: "Tech Solutions Inc.",
//     contactEmail: "contact@techsolutions.com",
//     contactPhone: "123-456-7890",
//     maxBookings: 10
// };

// let token;

// async function runTest() {
//     try {
//         // 1. Signup Admin
//         console.log('1. Signing up Admin...');
//         await axios.post(`${AUTH_URL}/signup`, testAdmin);
//         console.log('✅ Admin Signup Successful');

//         // 2. Login Admin
//         console.log('2. Logging in Admin...');
//         const loginRes = await axios.post(`${AUTH_URL}/login`, {
//             email: testAdmin.email,
//             password: testAdmin.password
//         });
//         token = loginRes.data.token;
//         console.log('✅ Admin Login Successful. Token received.');

//         // 3. Create Service
//         console.log('3. Creating Service...');
//         try {
//             const serviceRes = await axios.post(SERVICES_URL, validService, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             console.log('✅ Service Creation Successful:', serviceRes.data);
//         } catch (serviceErr) {
//             console.error('❌ Service Creation Failed!');
//             if (serviceErr.response) {
//                 console.error('Status:', serviceErr.response.status);
//                 console.error('Data:', serviceErr.response.data);
//             } else {
//                 console.error('Error:', serviceErr.message);
//             }
//         }

//     } catch (error) {
//         console.error('❌ Test Setup Failed:', error.message);
//     }

//     // 4. Test Invalid Category
//     console.log('\n4. Testing Invalid Category...');
//     try {
//         const invalidService = { ...validService, category: "InvalidCategory" };
//         await axios.post(SERVICES_URL, invalidService, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         console.error('❌ Invalid Category Check Failed (Should have failed)');
//     } catch (err) {
//         if (err.response) {
//             console.log(`✅ Invalid Category Check: Received Status ${err.response.status}`);
//             console.log('Error Message:', err.response.data);
//         }
//     }

//     // 5. Test Customer Role
//     console.log('\n5. Testing Customer Role...');
//     try {
//         // Signup Customer
//         const customer = { ...testAdmin, email: `cust_${Date.now()}@test.com`, role: 'customer' };
//         await axios.post(`${AUTH_URL}/signup`, customer);
//         const loginRes = await axios.post(`${AUTH_URL}/login`, { email: customer.email, password: customer.password });
//         const custToken = loginRes.data.token;

//         await axios.post(SERVICES_URL, validService, {
//             headers: { Authorization: `Bearer ${custToken}` }
//         });
//         console.error('❌ Customer Role Check Failed (Should have 403)');
//     } catch (err) {
//         if (err.response) {
//             console.log(`✅ Customer Role Check: Received Status ${err.response.status}`);
//         }
//     }
// }

// runTest();
