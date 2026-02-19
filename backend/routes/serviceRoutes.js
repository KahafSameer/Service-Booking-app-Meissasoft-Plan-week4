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
        const services = await prisma.service.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//get single service
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid service id' });
        const service = await prisma.service.findUnique({ where: { id } });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//update service (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid service id' });
        const { category, title, providerName, contactEmail, contactPhone, available, maxBookings } = req.body;
        const service = await prisma.service.update({
            where: { id },
            data: {
                ...(category !== undefined && { category }),
                ...(title !== undefined && { title }),
                ...(providerName !== undefined && { providerName }),
                ...(contactEmail !== undefined && { contactEmail }),
                ...(contactPhone !== undefined && { contactPhone }),
                ...(available !== undefined && { available }),
                ...(maxBookings !== undefined && { maxBookings }),
            }
        });
        res.json(service);
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Service not found' });
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//delete service (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid service id' });
        await prisma.service.delete({ where: { id } });
        res.json({ message: 'Service deleted' });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Service not found' });
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;