const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const auth = require('../middleware/auth');


router.post('/:serviceId', auth, async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.currentBookings >= service.maxBookings) {
            service.available = false;
            await service.save();
            return res.status(400).json({ message: 'Service is fully booked' });
        }


        const booking = new Booking({
            service: service._id,
            user: req.user._id,
        });

        await booking.save();

        service.currentBookings++;
        if (service.currentBookings >= service.maxBookings) {
            service.available = false;
        }
        await service.save();



        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
});


router.get('/my', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('service');
        res.json(bookings);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
});


router.get("/", auth, async (req, res) => {
    try {
        //rolback
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const bookings = await Booking.find().populate('service').populate('user', 'name email');
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
});


module.exports = router;