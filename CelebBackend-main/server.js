require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const celebrityRoutes = require('./routes/celebrityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// ---- Security & Performance ----
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(compression());
app.use(express.json());
app.use(morgan('tiny'));

// ---- CORS ----
const allowList = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: allowList.length ? allowList : true,
  credentials: true
}));

// ---- Rate Limiting ----
// Strict limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/adminlogin', authLimiter);
app.use('/api/userlogin', authLimiter);
app.use('/api/celebritylogin', authLimiter);
app.use('/api/userregister', authLimiter);
app.use('/api/celebrityregister', authLimiter);
app.use('/api', apiLimiter);

// ---- Health check ----
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ---- Static uploads ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- API Routes ----
app.use('/api/celebrities', celebrityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api', authRoutes);

// ---- 404 for unknown API routes ----
app.use('/api', (_req, res) => res.status(404).json({ message: 'Route not found' }));

// ---- Error handler ----
app.use((err, _req, res, _next) => {
  console.error(err);

  // Multer errors (file upload issues)
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ message: 'File too large. Maximum size is 10MB per image.' });
  if (err.code === 'LIMIT_FILE_COUNT')
    return res.status(400).json({ message: 'Too many files. Maximum 5 images allowed.' });
  if (err.code === 'LIMIT_UNEXPECTED_FILE')
    return res.status(400).json({ message: 'Unexpected file field. Use the "images" field.' });
  if (err.message === 'Only image files are allowed')
    return res.status(400).json({ message: 'Only image files are allowed (PNG, JPG, WebP, GIF).' });

  // JWT errors
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ')
    return res.status(400).json({ message: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(400).json({ message: `A record with this ${field} already exists.` });
  }

  res.status(err.status || 500).json({ message: err.message || 'An unexpected error occurred. Please try again.' });
});

// ---- Root route ----
app.get('/', (_req, res) => res.json({ message: 'CelebBackend API', health: true }));

// ---- Start server ----
(async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();