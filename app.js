import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import 'dotenv/config';

import contactsRouter from './routes/api/contacts.js';
import usersRouter from './routes/api/users.js';
import verifyRouter from './routes/api/verify.js';

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter);
app.use('/api', verifyRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

export default app;
