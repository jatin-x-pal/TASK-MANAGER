import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force Google DNS to fix SRV resolution issues
dns.setServers(['8.8.8.8']);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

import connectDB from './lib/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Database Connection
const initializeDatabase = async () => {
  try {
    await connectDB();
    
    // Seed a test user for development if needed
    if (process.env.NODE_ENV !== 'production') {
      const testEmail = 'test@example.com';
      const existingUser = await User.findOne({ email: testEmail });
      
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const user = await User.create({
          name: 'Test User',
          email: testEmail,
          password: hashedPassword,
          jobTitle: 'Developer',
          company: 'Task Flow',
        });
        console.log('[Seed] Test User Created: test@example.com / password123');

        // Seed some notifications
        const { default: Notification } = await import('./models/Notification.js');
        await Notification.create([

          { recipient: user._id, text: 'Task "Design Logo" completed by Alex', type: 'success' },
          { recipient: user._id, text: 'New project assigned to you', type: 'info' },
          { recipient: user._id, text: 'Deadline approaching for "Draft Contract"', type: 'warning' },
        ]);
        console.log('[Seed] Sample notifications created');
      }

    }
  } catch (error) {
    console.error(`[Server] Database initialization failed: ${error.message}`);
  }
};

initializeDatabase();


// Routes Placeholder
app.get('/', (req, res) => {
  res.send('Task Flow API is running...');
});

// Import and use routes
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import timeOffRoutes from './routes/timeOffRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/time-off', timeOffRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/schedules', (req, res, next) => {
  // Direct to the schedule handler in activityRoutes
  req.url = '/schedules';
  activityRoutes(req, res, next);
});







app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
