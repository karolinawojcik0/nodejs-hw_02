import express from 'express';
import Joi from 'joi';
import auth from '../../middleware/auth.js';
import {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} from '../../models/contacts.js';

const router = express.Router();

const baseSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
  }
  next();
};

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  console.log('Delete Request for Contact ID:', id);
  try {
    const contact = await getById(id);
    console.log('Contact found:', contact);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (contact.owner.toString() !== req.user.id.toString()) {
      console.log('Unauthorized - Owner mismatch');
      console.log('Contact owner:', contact.owner.toString());
      console.log('Request user ID:', req.user.id.toString());
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const success = await removeContact(id);
    console.log('Remove contact result:', success);
    if (success) {
      res.json({ message: 'Contact deleted' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.error('Error during contact deletion:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await getById(id);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, validateRequest(baseSchema), async (req, res) => {
  try {
    const owner = req.user._id;
    const newContact = await addContact({ ...req.body, owner });
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, validateRequest(baseSchema), async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (contact.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updatedContact = await updateContact(id, req.body);
    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', auth, validateRequest(baseSchema), async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (contact.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updatedContact = await updateContact(id, req.body);
    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/favorite', auth, async (req, res) => {
  const { id } = req.params;
  const { favorite } = req.body;
  try {
    const contact = await getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (contact.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updatedContact = await updateStatusContact(id, favorite);
    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
