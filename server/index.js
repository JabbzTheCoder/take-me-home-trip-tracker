import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import carRoutes from './routes/cars.js';
import { initDb, dbService } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tmh_tracker';

// Middleware
app.use(cors());
app.use(express.json());

// Routes (mounted with and without /api prefix for robust Vercel serverless execution)
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    database: dbService.isMongoActive() ? 'MongoDB Connected' : 'Persistent Database Store Active',
    time: new Date().toISOString()
  });
};

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/trips', tripRoutes);
app.use('/api/cars', carRoutes);
app.use('/cars', carRoutes);

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);


let isInitialized = false;
export async function initializeDatabase() {
  if (isInitialized) return;
  await initDb();

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 2000
      });
      console.log('Connected to MongoDB database.');
    }
  } catch (err) {
    console.warn('MongoDB connection notice:', err.message);
  }
  isInitialized = true;
}

// Start standalone server when run directly (not as a module import)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  initializeDatabase().then(() => {
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`Take Me Home backend server running on http://127.0.0.1:${PORT}`);
    });
  });
}

export default app;
