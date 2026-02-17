const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
router.post('/:serviceId', auth, async (req, res) => {
    const { serviceId } = req.params;

    try {
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.currentBookings >= service.maxBookings) {
            return res.status(400).json({ message: 'Service is fully booked' });
        }

        //++
        service.currentBookings += 1;
        await service.save();

        
        const booking = new Booking({
            service: serviceId,
            user: req.user.id
        });

        await booking.save();

        res.status(201).json({
            message: 'Booking created successfully',
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;