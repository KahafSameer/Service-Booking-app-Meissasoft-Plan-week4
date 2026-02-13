const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const auth = require('../middleware/auth');

//create service admin
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const service = new Service(req.body);
        await service.save();
        res.json(service);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

//get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// //get service by id
// router.get('/:id', async (req, res) => {
//     try {
//         const service = await Service.findById(req.params.id);
//         res.json(service);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// //update service
// router.put('/:id', authMiddleware, async (req, res) => {
//     try {
//         const { category, title, providerName, contactEmail, contactPhone, maxBookings } = req.body;
//         const service = await Service.findByIdAndUpdate(req.params.id, { category, title, providerName, contactEmail, contactPhone, maxBookings }, { new: true });
//         res.json(service);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// //delete service
// router.delete('/:id', authMiddleware, async (req, res) => {
//     try {
//         const service = await Service.findByIdAndDelete(req.params.id);
// //         res.json(service);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

module.exports = router;