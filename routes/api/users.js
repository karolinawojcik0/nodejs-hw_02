const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../../models/user');
const upload = require('../../middleware/upload');
const auth = require('../../middleware/auth');
const Joi = require('joi');
const Jimp = require('jimp');
const path = require('path');
const gravatar = require('gravatar');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
  }
  next();
};

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPassword,
      avatarURL: gravatar.url(email, { s: '250', d: 'retro' }, true)
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(201).json({ token, user: { email: user.email, subscription: user.subscription, avatarURL: user.avatarURL } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', validateRequest(loginSchema), async (req, res) => {
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

router.patch('/avatars', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filePath = path.join('tmp', req.file.filename);
    const newFileName = `avatar-${user._id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const newFilePath = path.join('public/avatars', newFileName);

    const image = await Jimp.read(filePath);
    await image.resize(250, 250).writeAsync(newFilePath);

    const fs = require('fs');
    fs.unlinkSync(filePath);

    user.avatarURL = `/avatars/${newFileName}`;
    await user.save();

    res.json({ avatarURL: user.avatarURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
