const Joi = require('joi');

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
}).or('name', 'email', 'phone');

const validateContact = (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: `missing required ${error.details[0].context.key} field` });
  }
  next();
};

const validateContactUpdate = (req, res, next) => {
  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'missing fields' });
  }
  next();
};

module.exports = {
  validateContact,
  validateContactUpdate,
};
