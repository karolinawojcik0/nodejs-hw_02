const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

const Contact = mongoose.model('contact', contactSchema);

const listContacts = async () => {
  return await Contact.find();
};

const getById = async (id) => {
  return await Contact.findById(id);
};

const addContact = async (contact) => {
  return await Contact.create(contact);
};

const removeContact = async (id) => {
  return await Contact.findByIdAndRemove(id);
};

const updateContact = async (id, data) => {
  return await Contact.findByIdAndUpdate(id, data, { new: true });
};

const updateStatusContact = async (id, favorite) => {
  return await Contact.findByIdAndUpdate(id, { favorite }, { new: true });
};

module.exports = {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};
