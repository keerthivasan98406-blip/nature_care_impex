const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['cocopeat', 'bamboo', 'eco-care']
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    sizes: [{
        type: String,
        required: true
    }],
    price: {
        type: Number,
        required: true,
        min: 0
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    minStock: {
        type: Number,
        default: 10,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ id: 1 });

module.exports = mongoose.model('Product', ProductSchema);