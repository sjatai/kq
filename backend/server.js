const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

// CORS for dev (allow all origins)
pp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins (frontend 3000, etc.)
  res.header('Access-Control-Allow-Credentials', false);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200); // Handle preflight
  } else {
    next();
  }
});

// DB connect
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/loyalty', require('./routes/loyalty'));

app.get('/health', (req, res) => res.status(200).json({ status: 'KQ Backend OK' }));
app.get('/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'KQ DB Connected' });
  } catch (err) {
    res.status(500).json({ error: 'KQ DB Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KQ server running on port ${PORT}`));