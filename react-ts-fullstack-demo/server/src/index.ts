import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';

const PORT = Number(process.env.PORT) || 5001;
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/react-ts-demo';
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:5174,http://localhost:3000,http://localhost,https://localhost,capacitor://localhost')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

start();