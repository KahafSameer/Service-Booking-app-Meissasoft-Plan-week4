const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const auth = require('../middleware/auth');

// ------------------------------
// Create a booking (customer)
// ------------------------------
router.post('/:serviceId', auth, async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Atomic increment: only if currentBookings < maxBookings
        const service = await Service.findOneAndUpdate(
            {
                _id: serviceId,
                $expr: { $lt: ["$currentBookings", "$maxBookings"] }
            },
            { $inc: { currentBookings: 1 } },
            { new: true }
        );

        if (!service) {
            // Check if service exists
            const exists = await Service.findById(serviceId);
            if (!exists) {
                return res.status(404).json({ message: 'Service not found' });
            }
            return res.status(400).json({ message: 'Service is fully booked' });
        }

        // Create booking
        try {
            const booking = new Booking({
                service: serviceId,
                user: req.user.id // auth middleware sets req.user.id
            });

            await booking.save();
            res.status(201).json({ message: 'Booking created successfully', booking });

        } catch (bookingError) {
            console.error("Booking error, rolling back:", bookingError);
            // Rollback increment
            await Service.findByIdAndUpdate(serviceId, { $inc: { currentBookings: -1 } });
            return res.status(500).json({ message: 'Failed to create booking' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ------------------------------
// Get logged-in user's bookings
// ------------------------------
router.get('/my', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('service');
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ------------------------------
// Admin: get all bookings
// ------------------------------
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const bookings = await Booking.find()
            .populate('service')
            .populate('user', 'name email role');
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
