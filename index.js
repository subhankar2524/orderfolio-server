require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 1. Import cors
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8080;

const defaultCorsOrigins = [
  'http://localhost:3000',
  'https://orderfolio-frontend.onrender.com',
];

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = corsOrigins.length > 0 ? corsOrigins : defaultCorsOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

connectDB();

app.use(express.json());
const shipmentRoutes = require("./routes/shipmentRoutes");

app.get('/', (req, res) => {
  res.send('Orderfolio Server is running!');
});


app.use('/api/auth', authRoutes);
app.use("/api/shipments", shipmentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
