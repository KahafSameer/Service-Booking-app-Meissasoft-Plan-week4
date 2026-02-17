const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authenticateToken = require('./middleware/auth');
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/dashboard',authenticateToken, dashboardRoutes);
app.use('/api/services', authenticateToken,serviceRoutes);
app.use('/api/booking',authenticateToken, bookingRoutes);

//testing routes

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//db

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => console.error('Error connecting to MongoDB:', err));


// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("MongoDB Connected");
//         console.log("DB Name:", mongoose.connection.name);
//     })
//     .catch(err => console.log(err));
