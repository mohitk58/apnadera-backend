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

// Environment variable validation
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set the following environment variables in your production environment:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

// Debug environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('PORT:', process.env.PORT);
} else {
  console.log('Production environment detected');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI configured:', !!process.env.MONGODB_URI);
  console.log('JWT_SECRET configured:', !!process.env.JWT_SECRET);
}

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5002;

// Trust proxy for Railway deployment (fixes rate limiting issues)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use a custom key generator that works with proxies
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    console.log('CORS request from origin:', origin);
    
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:5173',
      'https://localhost:5173',
      'https://apnadera.netlify.app',
      'https://apnadera-frontend.netlify.app',
      'https://apnadera-backend.railway.app'
    ];
    
    // Check if origin is in allowed list or contains netlify.app
    if (allowedOrigins.includes(origin) || origin.includes('netlify.app') || origin.includes('railway.app')) {
      console.log('CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check environment variables
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'not set',
      PORT: process.env.PORT || 'not set'
    };
    
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      environment_variables: envStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    };
    
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== ERROR LOG ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('URL:', req.url);
  console.error('Method:', req.method);
  console.error('Headers:', req.headers);
  console.error('Body:', req.body);
  console.error('================');
  
  // Check for specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.errors : undefined
    });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'Database operation failed'
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;

console.log('Attempting to connect to MongoDB...');
console.log('Connection string (masked):', mongoUri ? mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT SET');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  bufferMaxEntries: 0,
  bufferCommands: false
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('Database:', mongoose.connection.db.databaseName);
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Error details:', err);
  console.error('');
  console.error('🔧 Troubleshooting steps:');
  console.error('1. Check if MongoDB Atlas is accessible');
  console.error('2. Verify your connection string is correct');
  console.error('3. Ensure your IP is whitelisted in MongoDB Atlas');
  console.error('4. Check if your MongoDB user has proper permissions');
  console.error('');
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
}); 