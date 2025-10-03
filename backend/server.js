import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import and mount loyalty routes
import loyaltyRoutes from './routes/loyalty.js';
app.use('/api/loyalty', loyaltyRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'KQ Backend OK' }));
app.get('/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'KQ DB Connected' });
  } catch (err) {
    res.status(500).json({ error: 'KQ DB Error' });
  }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KQ server running on port ${PORT}`));




