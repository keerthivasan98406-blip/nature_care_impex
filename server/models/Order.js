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
        category: { type: String, default: 'General' },
        image: { type: String, default: '' },
        description: { type: String, default: '' }
    },
    customerDetails: {
        customerName: { type: String, default: 'Guest' },
        customerEmail: { type: String, default: '' },
        customerPhone: { type: String, default: '' },
        deliveryAddress: { type: String, default: '' },
        quantity: { type: Number, default: 1 },
        orderNotes: { type: String, default: '' }
    },
    unitPrice: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        default: 'pending'
    },
    productSize: {
        type: String,
        default: 'Standard'
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

// Mongoose automatically creates indexes for unique: true and index: true
// These manual definitions are redundant and causing warnings
OrderSchema.index({ 'customerDetails.customerEmail': 1 });
OrderSchema.index({ orderMonth: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);