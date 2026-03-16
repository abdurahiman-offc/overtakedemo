import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Database connection management for serverless context
let cachedPromise = null;

export const connectDB = async () => {
    // 1. If already connected, return immediately
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    
    // 2. If already connecting, return the existing promise
    if (cachedPromise) return cachedPromise;

    // 3. Otherwise, create a new connection promise
    console.log('Initializing new MongoDB connection...');
    cachedPromise = mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm-demo')
        .then((m) => {
            console.log('Connected to MongoDB successfully.');
            return m;
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            cachedPromise = null; // Reset on failure so next request can retry
            throw err;
        });

    return cachedPromise;
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Routes
app.use('/api', apiRoutes);

// Enhanced Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || 'Something went wrong on the server.';
    res.status(status).json({ 
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;
