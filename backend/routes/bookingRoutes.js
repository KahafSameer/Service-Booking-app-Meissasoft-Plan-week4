const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// const Service = require('../models/Service'); // MongoDB model (now migrated to Prisma)
// const Booking = require('../models/Booking'); // MongoDB model (now migrated to Prisma)
const prisma = require('../lib/prisma');
router.post('/:serviceId', auth, async (req, res) => {
    const { serviceId } = req.params;

    const parsedServiceId = parseInt(serviceId, 10);
    if (Number.isNaN(parsedServiceId)) {
        return res.status(400).json({ message: 'Invalid service id' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const service = await tx.service.findUnique({
                where: { id: parsedServiceId },
            });

            if (!service) {
                return { error: { status: 404, message: 'Service not found' } };
            }

            if (service.currentBookings >= service.maxBookings) {
                return { error: { status: 400, message: 'Service is fully booked' } };
            }

            const updatedService = await tx.service.update({
                where: { id: parsedServiceId },
                data: {
                    currentBookings: {
                        increment: 1,
                    },
                },
            });

            const booking = await tx.booking.create({
                data: {
                    serviceId: parsedServiceId,
                    userId: req.user.id,
                },
                include: {
                    service: true,
                    user: true,
                },
            });

            return { updatedService, booking };
        });

        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        res.status(201).json({
            message: 'Booking created successfully',
            booking: result.booking,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;