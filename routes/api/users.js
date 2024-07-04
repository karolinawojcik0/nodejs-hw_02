const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const { validateSignup, validateLogin } = require('../../validation/users');
const auth = require('../../middleware/auth');

const router = express.Router();

// sign up
router.post('/signup', async (req, res) => {
  const { error } = validateSignup(req.body);
  if (error) {
    return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
  }

  const { email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: 'Email in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  return res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
});

//log in
router.post('/login', async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Email or password is wrong' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Email or password is wrong' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  user.token = token;
  await user.save();

  return res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
});

// log out
router.get('/logout', auth, async (req, res) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();
    return res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// current
router.get('/current', auth, async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;



