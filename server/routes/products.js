const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not available',
                fallback: true
            });
        }

        const { category, active } = req.query;
        let filter = {};
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (active !== undefined) {
            filter.isActive = active === 'true';
        } else {
            filter.isActive = true; // Default to active products only
        }

        const products = await Product.find(filter).sort({ id: 1 });
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message,
            fallback: true
        });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: parseInt(req.params.id) });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// Create new product
router.post('/', async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not available - product cannot be saved',
                fallback: true
            });
        }

        // Get the next available ID
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const nextId = lastProduct ? lastProduct.id + 1 : 1;

        const productData = {
            ...req.body,
            id: nextId
        };

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating product',
            error: error.message,
            fallback: true
        });
    }
});

// Update product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// Delete product (hard delete - actually remove from database)
router.delete('/:id', async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not available - product cannot be deleted',
                fallback: true
            });
        }

        const productId = parseInt(req.params.id);
        console.log('Attempting to delete product with ID:', productId);

        const product = await Product.findOneAndDelete({ id: productId });

        if (!product) {
            console.log('Product not found with ID:', productId);
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log('Product deleted successfully:', product.name);
        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: product
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message,
            fallback: true
        });
    }
});

// Initialize default products
router.post('/initialize', async (req, res) => {
    try {
        const existingProducts = await Product.countDocuments();
        
        if (existingProducts > 0) {
            return res.json({
                success: true,
                message: 'Products already initialized',
                count: existingProducts
            });
        }

        const defaultProducts = [
            {
                id: 1,
                name: "Cocopeat 5kg Block",
                category: "cocopeat",
                image: "https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190898/photo_2025-12-31_22-18-07_c2hs4m.jpg",
                description: "Premium washed cocopeat blocks ideal for potting mixes and hydroponics. High water retention and porosity.",
                sizes: ["S", "M", "L", "XL", "XXL"],
                price: 250,
                cost: 150,
                stock: 100,
                minStock: 20
            },
            {
                id: 2,
                name: "Coco Grow Bags",
                category: "eco-care",
                image: "https://cdn.moglix.com/p/B5wXshH1wq7TS-xxlarge.jpg",
                description: "Ready-to-use grow bags for greenhouse cultivation. UV treated for durability and optimal root growth.",
                sizes: ["S", "M", "L", "XL", "XXL"],
                price: 90,
                cost: 60,
                stock: 200,
                minStock: 30
            },
            {
                id: 3,
                name: "Coco Bricks (650g)",
                category: "cocopeat",
                image: "https://images.unsplash.com/photo-1591857177580-dc82b9e4e119?auto=format&fit=crop&w=800&q=80",
                description: "Compact 650g briquettes, perfect for home gardening and smaller applications. Expands to 9 liters.",
                sizes: ["S", "M", "L", "XL", "XXL"],
                price: 180,
                cost: 120,
                stock: 150,
                minStock: 25
            },
            {
                id: 5,
                name: "Bamboo Period Pads",
                category: "bamboo",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbYHHF-lKgdGS9ftR4AwALD27xwGSO9hsldw&s",
                description: "Comfortable, absorbent, and eco-friendly bamboo period pads. Washable and reusable for a sustainable cycle.",
                sizes: ["S", "M", "L", "XL", "XXL"],
                price: 120,
                cost: 80,
                stock: 80,
                minStock: 15
            },
            {
                id: 6,
                name: "12 Coco Bricks 400g",
                category: "cocopeat",
                image: "https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190712/photo_2025-12-31_22-14-34_zu8ayl.jpg",
                description: "High-quality 400g coco peat bricks, perfect for home gardening and seed starting. Compact and easy to use.",
                sizes: ["S", "M", "L", "XL", "XXL"],
                price: 200,
                cost: 140,
                stock: 120,
                minStock: 20
            }
        ];

        await Product.insertMany(defaultProducts);

        res.status(201).json({
            success: true,
            message: 'Default products initialized successfully',
            count: defaultProducts.length
        });
    } catch (error) {
        console.error('Error initializing products:', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing products',
            error: error.message
        });
    }
});

module.exports = router;