import express from 'express';
import User from '../../models/user.js';

const router = express.Router();

router.get('/verify/:verificationToken', async (req, res) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.verificationToken = undefined;
    user.verify = true;
    await user.save();
    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
