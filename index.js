require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 1. Import cors
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Orderfolio Server is running!');
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});