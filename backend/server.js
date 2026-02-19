const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose'); // MongoDB (now migrated to Prisma/MySQL)
const dotenv = require('dotenv');
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authenticateToken = require('./middleware/auth');
const morgan = require('morgan')
dotenv.config();

const app = express();
app.use(morgan('dev'))
app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard',authenticateToken, dashboardRoutes);
app.use('/api/services', authenticateToken,serviceRoutes);
app.use('/api/booking',authenticateToken, bookingRoutes);

//testing routes 

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//db

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log('Connected to MongoDB');
//      
//     })
//     .catch((err) => console.error('Error connecting to MongoDB:', err));


   app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });