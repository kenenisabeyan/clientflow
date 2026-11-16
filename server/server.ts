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
const invoiceRoutes = require('./routes/invoiceRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { PORT, MONGO_URI } = require('./config/env');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

let lastDbError: string | null = null;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
    lastDbError = null;
  } catch (err: any) {
    lastDbError = err?.message || String(err);
    console.error('MongoDB connection error:', lastDbError);
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

app.get('/', (req: any, res: any) => {
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

app.get('/api/health', (req: any, res: any) => {
  const isConnected = mongoose.connection.readyState === 1;
  const hostPart = MONGO_URI ? MONGO_URI.split('@')[1] || 'local' : 'none';
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    database: isConnected ? 'connected' : 'disconnected',
    mongoHost: hostPart.split('/')[0],
    lastDbError: isConnected ? null : lastDbError,
    help: isConnected ? undefined : 'Please configure MONGO_URI in Render Environment Variables.',
    timestamp: new Date().toISOString()
  });
});

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/projects', '/projects'], projectRoutes);
app.use(['/api/activity', '/activity'], activityRoutes);
app.use(['/api/comments', '/comments'], commentRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/tasks', '/tasks'], taskRoutes);
app.use(['/api/invoices', '/invoices'], invoiceRoutes);
app.use(['/api/messages', '/messages'], messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Rejection detected:', err?.message || err);
});

process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception detected:', err?.message || err);
});