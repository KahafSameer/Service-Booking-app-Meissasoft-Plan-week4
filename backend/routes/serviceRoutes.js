// import express from 'express';
// const router = express.Router();
// // import Service from '../models/Service.js';
// import auth from '../middleware/auth.js';
// // import { PrismaClient } from '@prisma/client';
// import { prisma } from '../lib/prisma.js';

// // Allowed categories (enum)
// const VALID_CATEGORIES = [
//   "DevOps",
//   "DevSecOps",
//   "MLOps",
//   "CloudInfrastructure",
//   "CICDAutomation",
//   "Containerization",
//   "KubernetesManagement",
//   "MonitoringLogging",
//   "SecurityCompliance"
// ];

// //create service admin
// router.post('/', auth, async (req, res) => {
//     try {
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Forbidden Admin only' });
//         }

//         const { category, title, providerName, contactEmail, contactPhone } = req.body;
//         if (!category || !title || !providerName || !contactEmail || !contactPhone) {
//             return res.status(400).json({ message: 'Please enter all required fields' });
//         }
//         if(!VALID_CATEGORIES.includes(category)){
//             return res.status(400).json({message: `invalid categories. allowed categories are:  ${VALID_CATEGORIES.join(",")}`});
//         }

//         //         const service = new Service(req.body);
//         //         await service.save();
//         //         res.json(service);
//         //     } catch (err) {
//         //         console.error(err);

//         //         res.status(500).json({ message: 'Server error', error: err.message });

//         //     }
//         // });

//         const service = await prisma.service.create({
//             data: {
//                 category,
//                 title,
//                 providerName,
//                 contactEmail,
//                 contactPhone,
//                 available: true,          // default
//                 maxBookings: 5,           // default
//                 currentBookings: 0        // default
//             }
//         });

//         res.json(service);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// });

// //get all services
// router.get('/', async (req, res) => {
//     try {
//         const services = await prisma.service.findMany();
//         res.json(services);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         await prisma.service.delete({
//             where: { id: Number(req.params.id) }

//         })
//         res.json({ message: "Service deleted" })
//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }
// });

// router.put('/:id', async (req, res) => {
//   const { name, price, description } = req.body;
//   try {
//     const updated = await prisma.service.update({
//       where: { id: Number(req.params.id) },
//       data: { name, price, description }
//     });
//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.post('/:id/slots', async (req, res) => {
//     const { slots } = req.body
//     try {
//         const created = await prisma.timeSlot.createMany({
//             data: slots.map(slot => ({
//                 serviceId: Number(req.params.id),
//                 startTime: new Date(slot.startTime),
//                 endTime: new Date(slot.endTime)
//             }))
//         });

//         res.json(created)
//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }

// });

// router.get('/:id/slots', async (req, res) => {
//     const slots = await prisma.timeSlot.findMany({
//         where: {
//             serviceId: Number(req.params.id),
//             isBooked: false
//         }
//     })
//     res.json(slots)
// });


// router.put('/slots/:id/book', async (req, res) => {
//     try {
//         await prisma.timeSlot.update({
//             where: { id: Number(req.params.id) },
//             data: { isBooked: true }
//         });

//         res.json({ message: "Slot booked" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// router.put('/booking/:id/cancel', async (req, res) => {
//     try {
//         const booking = await prisma.booking.update({
//             where: { id: Number(req.params.id) },
//             data: { status: "CANCELLED" }
//         })

//         await prisma.timeSlot.update({
//             where: { id: booking.slotId },
//             data: { isBooked: false }
//         })

//         res.json({ message: "Booking cancelled" })
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


// export default router;

import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

// Allowed categories (enum)
const VALID_CATEGORIES = [
  "DevOps",
  "DevSecOps",
  "MLOps",
  "CloudInfrastructure",
  "CICDAutomation",
  "Containerization",
  "KubernetesManagement",
  "MonitoringLogging",
  "SecurityCompliance"
];

// --- CREATE SERVICE (Admin only) ---
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin only' });
    }

    const { category, title, providerName, contactEmail, contactPhone, maxBookings } = req.body;

    if (!category || !title || !providerName || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(", ")}` });
    }

    const maxBookingsInt = parseInt(maxBookings ?? 5, 10);
    if (Number.isNaN(maxBookingsInt) || maxBookingsInt < 1) {
      return res.status(400).json({ message: 'maxBookings must be a positive integer' });
    }

    const service = await prisma.service.create({
      data: {
        category,
        title,
        providerName,
        contactEmail,
        contactPhone,
        available: true,
        maxBookings: maxBookingsInt,
        currentBookings: 0
      }
    });

    res.status(201).json(service);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- GET ALL SERVICES ---
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- GET SINGLE SERVICE ---
router.get('/:id', async (req, res) => {
  const serviceId = parseInt(req.params.id, 10);
  if (Number.isNaN(serviceId)) return res.status(400).json({ message: 'Invalid service ID' });

  try {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- DELETE SERVICE (Admin only, cascade-safe) ---
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });

  const serviceId = parseInt(req.params.id, 10);
  if (Number.isNaN(serviceId)) return res.status(400).json({ message: 'Invalid service ID' });

  try {
    await prisma.service.delete({
      where: { id: serviceId }
    });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2003') {
      return res.status(400).json({ message: 'Cannot delete service: Foreign key constraint exists (bookings/slots).' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- UPDATE SERVICE (Admin only) ---
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });

  const serviceId = parseInt(req.params.id, 10);
  if (Number.isNaN(serviceId)) return res.status(400).json({ message: 'Invalid service ID' });

  const { title, providerName, contactEmail, contactPhone, available, maxBookings } = req.body;

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (providerName !== undefined) updateData.providerName = providerName;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (available !== undefined) updateData.available = available;
    if (maxBookings !== undefined) {
      const maxBookingsInt = parseInt(maxBookings, 10);
      if (Number.isNaN(maxBookingsInt) || maxBookingsInt < 1) {
        return res.status(400).json({ message: 'maxBookings must be a positive integer' });
      }
      updateData.maxBookings = maxBookingsInt;
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: updateData
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- SLOTS ---
router.post('/:id/slots', auth, async (req, res) => {
  const serviceId = parseInt(req.params.id, 10);
  if (Number.isNaN(serviceId)) return res.status(400).json({ message: 'Invalid service ID' });

  const { slots } = req.body;
  if (!Array.isArray(slots) || slots.length === 0) return res.status(400).json({ message: 'Slots must be a non-empty array' });

  try {
    const created = await prisma.timeSlot.createMany({
      data: slots.map(slot => ({
        serviceId,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime)
      }))
    });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id/slots', async (req, res) => {
  const serviceId = parseInt(req.params.id, 10);
  if (Number.isNaN(serviceId)) return res.status(400).json({ message: 'Invalid service ID' });

  try {
    const slots = await prisma.timeSlot.findMany({
      where: { serviceId, isBooked: false }
    });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- BOOK SLOT ---
router.put('/slots/:id/book', auth, async (req, res) => {
  const slotId = parseInt(req.params.id, 10);
  if (Number.isNaN(slotId)) return res.status(400).json({ message: 'Invalid slot ID' });

  try {
    await prisma.timeSlot.update({
      where: { id: slotId },
      data: { isBooked: true }
    });
    res.json({ message: 'Slot booked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- CANCEL BOOKING ---
router.put('/booking/:id/cancel', auth, async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (Number.isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });

    if (booking.slotId) {
      await prisma.timeSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false }
      });
    }

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
