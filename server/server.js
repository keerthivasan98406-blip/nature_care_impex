const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the parent directory (where HTML files are)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nature Care Impex API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve HTML files for specific routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'about.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'products.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

app.get('/owner', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'owner.html'));
});

app.get('/track-order', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'track-order.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'payment.html'));
});

app.get('/order-details', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'order-details.html'));
});

// Catch all handler for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Nature Care Impex Server Started');
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('📋 Available routes:');
    console.log('   • http://localhost:' + PORT + ' (Home)');
    console.log('   • http://localhost:' + PORT + '/about (About)');
    console.log('   • http://localhost:' + PORT + '/products (Products)');
    console.log('   • http://localhost:' + PORT + '/contact (Contact)');
    console.log('   • http://localhost:' + PORT + '/owner (Owner Portal)');
    console.log('   • http://localhost:' + PORT + '/track-order (Track Order)');
    console.log('   • http://localhost:' + PORT + '/api/health (API Health)');
    console.log('✨ Ready to serve requests!');
});

module.exports = app;