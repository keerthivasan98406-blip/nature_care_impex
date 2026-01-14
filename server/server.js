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
app.use(express.static(path.join(__dirname, '..')));

// Serve static files from html, css, js, and assets folders
app.use(express.static(path.join(__dirname, '..', 'html')));
app.use(express.static(path.join(__dirname, '..', 'css')));
app.use(express.static(path.join(__dirname, '..', 'js')));
app.use(express.static(path.join(__dirname, '..', 'assets')));

// Routes for HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});

app.get('/owner', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'owner.html'));
});

app.get('/owner.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'owner.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'products.html'));
});

app.get('/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'products.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'contact.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'contact.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'about.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'about.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'payment.html'));
});

app.get('/payment.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'payment.html'));
});

app.get('/order-details', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'order-details.html'));
});

app.get('/order-details.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'order-details.html'));
});

app.get('/product-detail', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'product-detail.html'));
});

app.get('/product-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'product-detail.html'));
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
