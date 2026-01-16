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
app.use(express.json());

// Set proper MIME types for static files
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.css')) {
    res.type('text/css');
  } else if (req.path.endsWith('.html')) {
    res.type('text/html');
  }
  next();
});

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve static files from html, css, js, and assets folders
app.use('/html', express.static(path.join(__dirname, '..', 'html')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Routes for HTML files - serve from root directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/owner', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'owner.html'));
});

app.get('/owner.html', (req, res) => {
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

// API Routes (if you add APIs later)
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running successfully', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 404 - Page not found (serve index.html as fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
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
