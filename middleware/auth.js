import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const auth = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  console.log('Authorization Header:', authorization);
  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer' || !token) {
    console.log('No token provided or incorrect format');
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    const user = await User.findById(decoded.id);
    console.log('User:', user);

    if (!user || user.token !== token) {
      console.log('User not found or token mismatch');
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authorization Error:', error);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export default auth;
