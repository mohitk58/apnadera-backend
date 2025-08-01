const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

// Load environment variables - try multiple sources
if (process.env.NODE_ENV !== 'production') {
  // Development: try config.env first, then .env
  require('dotenv').config({ path: './config.env' });
  if (!process.env.MONGODB_URI) {
    require('dotenv').config();
  }
} else {
  // Production: try .env first, then platform env vars
  require('dotenv').config();
}

// Debug environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('PORT:', process.env.PORT);
}

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://apnadera.netlify.app', 
        'https://sprightly-choux-d84160.netlify.app',
        'https://*.netlify.app'
      ] 
    : 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Make upload available to routes
app.locals.upload = upload;

// Routes
app.use('/auth', authRoutes);
app.use('/properties', propertyRoutes);
app.use('/users', userRoutes);
app.use('/contact', contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB
let mongoUri = process.env.MONGODB_URI;

// Temporary fallback for development/testing (remove in production)
if (!mongoUri) {
  console.warn('⚠️  MONGODB_URI not found, using fallback URI');
  mongoUri = 'mongodb+srv://mohitkumar:1WV0g2CIRzWI8U8X@cluster1.0ih7ekv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.error('');
  console.error('🔧 To fix this in Railway:');
  console.error('1. Go to your Railway dashboard');
  console.error('2. Click on your backend service');
  console.error('3. Go to "Variables" tab');
  console.error('4. Add MONGODB_URI with your MongoDB connection string');
  console.error('5. Also add NODE_ENV=production');
  console.error('');
  console.error('📝 Your MongoDB URI should look like:');
  console.error('mongodb+srv://username:password@cluster.mongodb.net/database');
  console.error('');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 