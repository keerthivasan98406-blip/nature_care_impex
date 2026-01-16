const express = require('express');
const router = express.Router();
const multer = require('multer');
const Order = require('../models/Order');

// Configure multer for file uploads (screenshots)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Get all orders
router.get('/', async (req, res) => {
    try {
        const { status, month, email, limit = 50, page = 1 } = req.query;
        let filter = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (month) {
            filter.orderMonth = month;
        }
        
        if (email) {
            filter['customerDetails.customerEmail'] = email;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            count: orders.length,
            total: total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// Get single order by ID
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// Track order (public endpoint)
router.post('/track', async (req, res) => {
    try {
        const { orderId, email } = req.body;
        
        // Allow search by either orderId OR email
        if (!orderId && !email) {
            return res.status(400).json({
                success: false,
                message: 'Either Order ID or email is required'
            });
        }

        let query = {};
        
        // Search by orderId only
        if (orderId && !email) {
            query = { orderId: orderId };
        }
        // Search by email only
        else if (email && !orderId) {
            query = { 'customerDetails.customerEmail': email };
        }
        // Search by both (most secure)
        else {
            query = {
                orderId: orderId,
                'customerDetails.customerEmail': email
            };
        }

        console.log('🔍 Tracking order with query:', query);

        const order = await Order.findOne(query);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found with provided details'
            });
        }

        console.log('✅ Order found:', order.orderId);

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking order',
            error: error.message
        });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            orderDate: new Date().toISOString().split('T')[0],
            orderMonth: new Date().toISOString().slice(0, 7)
        };

        const order = new Order(orderData);
        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        const validStatuses = ['pending', 'payment_submitted', 'screenshot', 'processing', 'shipped', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status: status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// Upload payment screenshot
router.post('/:orderId/screenshot', upload.single('screenshot'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No screenshot file provided'
            });
        }

        // Convert file to base64 for storage
        const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const screenshotData = {
            filename: `screenshot_${Date.now()}.${req.file.mimetype.split('/')[1]}`,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            dataUrl: dataUrl,
            uploadedAt: new Date()
        };

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { 
                paymentScreenshot: screenshotData,
                status: 'screenshot'
            },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Screenshot uploaded successfully',
            data: {
                orderId: order.orderId,
                status: order.status,
                screenshot: {
                    filename: screenshotData.filename,
                    uploadedAt: screenshotData.uploadedAt
                }
            }
        });
    } catch (error) {
        console.error('Error uploading screenshot:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading screenshot',
            error: error.message
        });
    }
});

// Get order statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const { month } = req.query;
        let matchFilter = {};
        
        if (month) {
            matchFilter.orderMonth = month;
        }

        const stats = await Order.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    pendingOrders: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['pending', 'screenshot']] },
                                1,
                                0
                            ]
                        }
                    },
                    completedOrders: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'completed'] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            completedOrders: 0
        };

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching order statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order statistics',
            error: error.message
        });
    }
});

// Get monthly sales data
router.get('/stats/monthly', async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        
        const monthlyStats = await Order.aggregate([
            {
                $match: {
                    orderMonth: { $regex: `^${year}` }
                }
            },
            {
                $group: {
                    _id: '$orderMonth',
                    sales: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: monthlyStats
        });
    } catch (error) {
        console.error('Error fetching monthly statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly statistics',
            error: error.message
        });
    }
});

module.exports = router;