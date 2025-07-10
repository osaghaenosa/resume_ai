import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

router.put('/:id', async (req, res) => {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 03bf448cee3561e1b68a09c508de34705e343ff5
