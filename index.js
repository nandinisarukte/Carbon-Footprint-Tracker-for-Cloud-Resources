const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const emissionRoutes = require('./routes/emissions');
const recommendationRoutes = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend web client
app.use(cors({
  origin: '*', // In production, replace with specific domain(s)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Main API Endpoints
app.use('/auth', authRoutes);
app.use('/resources', resourceRoutes);
app.use('/emissions', emissionRoutes);
app.use('/recommendations', recommendationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    service: 'carbon-footprint-tracker-backend'
  });
});

// Fallback Route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const initDb = require('./config/initDb');

// Run database bootstrapping, then start the server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database bootstrapping failed, attempting to start server anyway:', err.message);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
