const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    product: {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        image: { type: String, required: true },
        description: { type: String, required: true }
    },
    customerDetails: {
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        deliveryAddress: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        orderNotes: { type: String, default: '' }
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'payment_submitted', 'screenshot', 'processing', 'shipped', 'completed', 'cancelled'],
        default: 'pending'
    },
    productSize: {
        type: String,
        required: true
    },
    paymentScreenshot: {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        dataUrl: String,
        uploadedAt: Date
    },
    orderDate: {
        type: String,
        required: true
    },
    orderMonth: {
        type: String,
        required: true
    },
    submittedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ 'customerDetails.customerEmail': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderMonth: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);