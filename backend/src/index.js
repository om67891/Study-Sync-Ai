import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import plansRouter from './routes/plans.js';
import marketingRouter from './routes/marketing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' })); // Limit body size

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 generations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Generation rate limit exceeded. Try again later.' }
});

app.use(limiter);

// Routes
app.use('/api/plans/generate', generateLimiter);
app.use('/api/plans', plansRouter);
app.use('/api', marketingRouter);

app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // In a real app, you would save this to the DB or send an email.
    // For now, we'll just mock a success response.
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudySync AI backend is running"
  });
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Do not expose stack traces in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
