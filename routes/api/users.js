const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const User = require('../../models/user');
const { validateSignup, validateLogin } = require('../../validation/users');
const auth = require('../../middleware/auth');
const multer = require('multer');
const jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs/promises');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../tmp'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = uuidv4() + ext;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
}).single('avatar');

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

  const avatarURL = gravatar.url(email, {
    s: '200',
    r: 'pg', 
    d: 'identicon',
  });

  const user = new User({ email, password: hashedPassword, avatarURL });
  await user.save();

  return res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    },
  });
});

// log in
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
      avatarURL: user.avatarURL,
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
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/avatars', auth, async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error' });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const image = await jimp.read(file.path);
      await image.resize(250, 250).writeAsync(file.path);

      const avatarFileName = uuidv4() + path.extname(file.originalname);

      const newAvatarPath = path.join(__dirname, '../../public/avatars', avatarFileName);
      await fs.rename(file.path, newAvatarPath);

      const user = req.user;
      user.avatarURL = `/avatars/${avatarFileName}`;
      await user.save();

      return res.status(200).json({ avatarURL: user.avatarURL });
    } catch (error) {
      console.error('Avatar processing error:', error);
      return res.status(500).json({ message: 'Avatar processing error' });
    }
  });
});

module.exports = router;
