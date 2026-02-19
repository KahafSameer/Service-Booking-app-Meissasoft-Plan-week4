import express from 'express';
import cors from 'cors';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authenticateToken from './middleware/auth.js';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/services', authenticateToken, serviceRoutes);
app.use('/api/booking', authenticateToken, bookingRoutes);

//testing routes 

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//db

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log('Connected to MongoDB');

//     })
//     .catch((err) => console.error('Error connecting to MongoDB:', err));


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});