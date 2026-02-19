const express = require('express');
const router = express.Router();
// const Service = require('../models/Service'); // MongoDB model (now migrated to Prisma)
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');

//create service admin (Prisma + MySQL)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { category, title, providerName, contactEmail, contactPhone } = req.body;
        if (!category || !title || !providerName || !contactEmail || !contactPhone) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        // const service = new Service(req.body); // MongoDB create
        // await service.save();

        const service = await prisma.service.create({
            data: {
                category,
                title,
                providerName,
                contactEmail,
                contactPhone,
                // Defaults for availability and booking limits
                available: req.body.available ?? true,
                maxBookings: req.body.maxBookings ?? 5,
                currentBookings: 0,
            },
        });

        res.json(service);
    } catch (err) {
        console.error(err);
     
        res.status(500).json({ message: 'Server error', error: err.message });
         
    }
});

//get all services (Prisma + MySQL)
router.get('/', async (req, res) => {
    try {
        // const services = await Service.find(); // MongoDB query
        const services = await prisma.service.findMany();
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;