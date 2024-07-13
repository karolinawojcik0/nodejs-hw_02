const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../../models/user');
const upload = require('../../middleware/upload');
const auth = require('../../middleware/auth');
const { validateRequest, checkRequiredFields } = require('../../validation/users');

// LOG IN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();
    res.json({ token, user: { email: user.email, subscription: user.subscription, avatarURL: user.avatarURL } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AVATAR UPLOAD
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const avatarPath = `/avatars/${req.file.filename}`;
    user.avatarURL = avatarPath;
    await user.save();
    res.json({ avatarURL: user.avatarURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
