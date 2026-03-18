const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const commentRoutes = require('./routes/commentRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (for development, allow all)
app.use(cors());

// Logging in development
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activity', activityRoutes);

// Frontend routes (render pages)
// We'll create a few routes to serve the EJS pages
app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));

// Protected pages – we'll use middleware to check JWT and pass user data
const { protect } = require('./middleware/authMiddleware');

app.get('/dashboard', protect, (req, res) => {
  res.render('pages/dashboard', { user: req.user });
});

app.get('/projects', protect, (req, res) => {
  res.render('pages/projects', { user: req.user });
});

app.get('/projects/:id', protect, async (req, res) => {
  // We'll fetch project data client-side via API, so just pass user and projectId
  res.render('pages/projectDetail', { user: req.user, projectId: req.params.id });
});

app.get('/create-project', protect, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }
  res.render('pages/createProject', { user: req.user });
});

app.get('/activity', protect, (req, res) => {
  res.render('pages/activity', { user: req.user });
});

app.get('/settings', protect, (req, res) => {
  res.render('pages/settings', { user: req.user });
});

app.get('/user-management', protect, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }
  res.render('pages/userManagement', { user: req.user });
});

// Redirect root to login or dashboard based on auth? For simplicity, redirect to login
app.get('/', (req, res) => res.redirect('/login'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});