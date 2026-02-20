import express from 'express';
const router = express.Router();
// import Service from '../models/Service.js';
import auth from '../middleware/auth.js';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';


//create service admin
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { category, title, providerName, contactEmail, contactPhone } = req.body;
        if (!category || !title || !providerName || !contactEmail || !contactPhone) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

//         const service = new Service(req.body);
//         await service.save();
//         res.json(service);
//     } catch (err) {
//         console.error(err);
     
//         res.status(500).json({ message: 'Server error', error: err.message });
         
//     }
// });

        const service = await prisma.service.create({
            data: {
                category,
                title,
                providerName,
                contactEmail,
                contactPhone,
                available: true,          // default
                maxBookings: 5,           // default
                currentBookings: 0        // default
            }
        });

        res.json(service);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

//get all services
router.get('/', async (req, res) => {
    try {
        const services = await prisma.service.findMany();
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;



// import express from 'express';
// const router = express.Router();
// import auth from '../middleware/auth.js';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Create service (admin only)
// router.post('/', auth, async (req, res) => {
//     try {
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Forbidden' });
//         }

//         const { category, title, providerName, contactEmail, contactPhone } = req.body;

//         if (!category || !title || !providerName || !contactEmail || !contactPhone) {
//             return res.status(400).json({ message: 'Please enter all required fields' });
//         }

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

// // Get all services
// router.get('/', async (req, res) => {
//     try {
//         const services = await prisma.service.findMany();
//         res.json(services);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// export default router;
