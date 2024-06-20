const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const contactsRouter = require('./routes/api/contacts');

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(3000, () => {
  console.log('Server running. Use our API on port: 3000');
});

module.exports = app;
