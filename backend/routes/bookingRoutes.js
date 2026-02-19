const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');

//get all bookings (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const bookings = await prisma.booking.findMany({
            include: {
                service: true,
                user: { select: { id: true, name: true, email: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//get my bookings (current user)
router.get('/my', auth, async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: { service: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

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
                    user: { select: { id: true, name: true, email: true, role: true } },
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

//cancel booking (user's own or admin)
router.delete('/:bookingId', auth, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.bookingId, 10);
        if (Number.isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking id' });
        const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true } });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await prisma.$transaction(async (tx) => {
            await tx.booking.delete({ where: { id: bookingId } });
            await tx.service.update({
                where: { id: booking.serviceId },
                data: { currentBookings: { decrement: 1 } }
            });
        });
        res.json({ message: 'Booking cancelled' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;