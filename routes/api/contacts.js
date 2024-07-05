const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../../middleware/auth');
const {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require('../../models/contacts');

const baseSchema = Joi.object({
  owner: Joi.string().required(),
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

const checkRequiredFields = (fields) => (req, res, next) => {
  for (const field of fields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `Validation error: missing required field ${field}` });
    }
  }
  next();
};

router.get('/', async (req, res) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
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

router.post('/', auth, validateRequest(baseSchema), checkRequiredFields(['name', 'email', 'phone']), async (req, res) => {
  try {
    const owner = req.user.id;
    const newContact = await addContact({ ...req.body, owner });
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (contact.owner !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const success = await removeContact(id);
    if (success) {
      res.json({ message: 'Contact deleted' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, validateRequest(baseSchema), checkRequiredFields(['name', 'email', 'phone']), async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (contact.owner !== req.user.id) {
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
    if (contact.owner !== req.user.id) {
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
    if (contact.owner !== req.user.id) {
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

module.exports = router;





