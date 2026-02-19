import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
// import Service from '../models/Service.js';
// import Booking from '../models/Booking.js';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

// const prisma = new PrismaClient();

router.post('/:serviceId', auth, async (req, res) => {
    const { serviceId } = req.params;
    console.log("service id: ", serviceId);

    const parsedServiceId = parseInt(serviceId, 10);
    if (!serviceId || Number.isNaN(parsedServiceId)) {
        return res.status(400).json({ message: 'Invalid or missing service ID' });
    }

    try {
       const service = await prisma.service.findUnique({
    where: { id: parsedServiceId } // MySQL id is Int
});


        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.currentBookings >= service.maxBookings) {
            return res.status(400).json({ message: 'Service is fully booked' });
        }

        //++
        // service.currentBookings += 1;
        // await service.save();

                await prisma.service.update({
            where: {id: parsedServiceId},
            data: {
                currentBookings: {
                    increment: 1
                }
            }
        })


        
        // const booking = new Booking({
        //     service: serviceId,
        //     user: req.user.id
        // });

        // await booking.save();

const booking = await prisma.booking.create({
    data: {
        serviceId: parsedServiceId,
        userId: parseInt(req.user.id)
    }
});


        res.status(201).json({
            message: 'Booking created successfully',
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
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
export default router;