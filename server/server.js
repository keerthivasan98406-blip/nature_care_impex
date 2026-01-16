const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set proper MIME types for static files
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.css')) {
    res.type('text/css');
  } else if (req.path.endsWith('.html')) {
    res.type('text/html');
  } else if (req.path.endsWith('.json')) {
    res.type('application/json');
  }
  next();
});

// API Routes FIRST (before static files)
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server running successfully', 
    timestamp: new Date(),
    database: 'connected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from specific folders with proper MIME types
app.use('/css', express.static(path.join(__dirname, '..', 'css'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.use('/js', express.static(path.join(__dirname, '..', 'js'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// HTML Routes - Explicitly serve from root directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/owner', (req, res) => {
  console.log('📋 Serving owner portal from root');
  res.sendFile(path.join(__dirname, '..', 'owner.html'));
});

app.get('/owner.html', (req, res) => {
  console.log('📋 Serving owner.html from root');
  res.sendFile(path.join(__dirname, '..', 'owner.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'products.html'));
});

app.get('/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'products.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'about.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'about.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'payment.html'));
});

app.get('/payment.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'payment.html'));
});

app.get('/order-details', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'order-details.html'));
});

app.get('/order-details.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'order-details.html'));
});

app.get('/product-detail', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'product-detail.html'));
});

app.get('/product-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'product-detail.html'));
});

app.get('/track-order', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'track-order.html'));
});

app.get('/track-order.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'track-order.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ 
    success: false,
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// 404 - Page not found
app.use((req, res) => {
  console.log('⚠️ 404 Not Found:', req.path);
  res.status(404).sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
  =========================================
  🚀 Nature Care Impex Server Running
  =========================================
  
  Main Website:    http://localhost:${PORT}
  Owner Portal:    http://localhost:${PORT}/owner
  Products:        http://localhost:${PORT}/products
  Health Check:    http://localhost:${PORT}/api/health
  
  =========================================
  `);
});

module.exports = app;
