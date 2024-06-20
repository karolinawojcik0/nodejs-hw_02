const express = require('express');
const router = express.Router();
const {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact,
} = require('../models/contacts');
const { validateContact, validateContactUpdate } = require('../validation/contactValidation');

router.get('/', async (req, res) => {
  const contacts = await listContacts();
  res.status(200).json(contacts);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const contact = await getById(id);
  if (contact) {
    res.status(200).json(contact);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

router.post('/', validateContact, async (req, res) => {
  const contact = await addContact(req.body);
  res.status(201).json(contact);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await removeContact(id);
  if (result) {
    res.status(200).json({ message: 'contact deleted' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

router.put('/:id', validateContactUpdate, async (req, res) => {
  const { id } = req.params;
  const updatedContact = await updateContact(id, req.body);
  if (updatedContact) {
    res.status(200).json(updatedContact);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

module.exports = router;
