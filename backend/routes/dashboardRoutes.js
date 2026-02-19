import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/data', auth, (req, res) => {
    res.json({ message: `welcome user ${req.user.id}` });
});

export default router;




