const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const { validateSignup, validateLogin } = require('../../validation/users');
const auth = require('../../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => { /* ... */ });

router.post('/login', async (req, res) => { /* ... */ });

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


