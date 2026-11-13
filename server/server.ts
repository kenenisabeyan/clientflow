const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const activityRoutes = require('./routes/activityRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { PORT, MONGO_URI } = require('./config/env');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err: any) {
    console.error('MongoDB connection error:', err?.message || err);
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

app.get('/', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    name: 'ClientFlow API',
    status: isConnected ? 'online' : 'degraded (waiting for database)',
    database: isConnected ? 'connected' : 'disconnected',
    version: '1.0.0',
    documentation: 'https://github.com/kenenisabeyan/clientflow',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    database: isConnected ? 'connected' : 'disconnected',
    help: isConnected ? undefined : 'Please configure MONGO_URI in Render Environment Variables.',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));