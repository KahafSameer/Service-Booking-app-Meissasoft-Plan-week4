// import express from 'express';
// const router = express.Router();
// import auth from '../middleware/auth.js';
// // import Service from '../models/Service.js';
// // import Booking from '../models/Booking.js';
// // import { PrismaClient } from '@prisma/client';
// import { prisma } from '../lib/prisma.js';

// // const prisma = new PrismaClient();

// router.post('/:serviceId', auth, async (req, res) => {
//     const { serviceId } = req.params;
//     console.log("service id: ", serviceId);

//     const parsedServiceId = parseInt(serviceId, 10);
//     if (!serviceId || Number.isNaN(parsedServiceId)) {
//         return res.status(400).json({ message: 'Invalid or missing service ID' });
//     }

//     try {
//         const service = await prisma.service.findUnique({
//             where: { id: parsedServiceId } // MySQL id is Int
//         });


//         if (!service) {
//             return res.status(404).json({ message: 'Service not found' });
//         }

//         if (service.currentBookings >= service.maxBookings) {
//             return res.status(400).json({ message: 'Service is fully booked' });
//         }

//         //++
//         // service.currentBookings += 1;
//         // await service.save();

//         await prisma.service.update({
//             where: { id: parsedServiceId },
//             data: {
//                 currentBookings: {
//                     increment: 1
//                 }
//             }
//         })



//         // const booking = new Booking({
//         //     service: serviceId,
//         //     user: req.user.id
//         // });

//         // await booking.save();

//         const booking = await prisma.booking.create({
//             data: {
//                 serviceId: parsedServiceId,
//                 userId: parseInt(req.user.id)
//             }
//         });


//         res.status(201).json({
//             message: 'Booking created successfully',
//             booking
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


// router.get('/my', auth, async (req, res) => {
//     try {
//         const bookings = await prisma.booking.findMany({
//             where: { userId: req.user.id },
//             include: { service: true },
//             orderBy: { createdAt: 'desc' }
//         });
//         res.json(bookings);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });



// router.put('/services/:id', auth, async (req, res) => {
//     const { id } = req.params;
//     const { name, price, description } = req.body;

//     try {
//         const updated = await prisma.service.update({
//             where: { id: parseInt(id) },
//             data: { name, price, description },
//         });

//         res.json(updated);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
// export default router;



import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

// --- CREATE BOOKING ---
router.post('/:serviceId', auth, async (req, res) => {
  const serviceId = parseInt(req.params.serviceId, 10);
  const userId = parseInt(req.user.id, 10);

  if (Number.isNaN(serviceId)) return res.status(400).json({ message: 'Invalid service ID' });

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (!service.available) return res.status(400).json({ message: 'Service is not available for booking' });
    if (service.currentBookings >= service.maxBookings) {
      return res.status(400).json({ message: 'Service is fully booked' });
    }

    // Increment currentBookings safely
    await prisma.service.update({
      where: { id: serviceId },
      data: { currentBookings: { increment: 1 } }
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: { serviceId, userId }
    });

    res.status(201).json({ message: 'Booking created successfully', booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- GET MY BOOKINGS ---
router.get('/my', auth, async (req, res) => {
  const userId = parseInt(req.user.id, 10);

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- GET ALL BOOKINGS (Admin only) ---
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });

  try {
    const bookings = await prisma.booking.findMany({
      include: { service: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- CANCEL BOOKING ---
router.put('/:bookingId/cancel', auth, async (req, res) => {
  const bookingId = parseInt(req.params.bookingId, 10);
  if (Number.isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only booking owner or admin can cancel
    if (req.user.role !== 'admin' && booking.userId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Forbidden: You cannot cancel this booking' });
    }

    // Cancel booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });

    // Decrement currentBookings on the service
    await prisma.service.update({
      where: { id: booking.serviceId },
      data: { currentBookings: { decrement: 1 } }
    });

    res.json({ message: 'Booking cancelled successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;