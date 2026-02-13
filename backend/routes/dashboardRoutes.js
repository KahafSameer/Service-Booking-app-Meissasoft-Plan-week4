const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/data', auth, (req, res) => {
    res.json({ message: `welcome user ${req.user.id}` });
});

module.exports = router;




