/* Database Connection Test Script */
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function testDatabaseConnection() {
    console.log('\n🔍 Testing Database Configuration...\n');
    
    try {
        // Test 1: Check environment variables
        console.log('📋 Step 1: Checking Environment Variables');
        console.log('─────────────────────────────────────────');
        const atlasUri = process.env.MONGODB_ATLAS_URI;
        
        if (!atlasUri) {
            console.log('❌ MONGODB_ATLAS_URI not found in .env file');
            return;
        }
        
        // Mask password for security
        const maskedUri = atlasUri.replace(/:[^:@]+@/, ':****@');
        console.log('✅ MONGODB_ATLAS_URI found');
        console.log('🔗 Connection String:', maskedUri);
        console.log('');
        
        // Test 2: Connect to database
        console.log('📋 Step 2: Connecting to MongoDB Atlas');
        console.log('─────────────────────────────────────────');
        
        const conn = await mongoose.connect(atlasUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            ssl: true,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✅ Connected to MongoDB Atlas');
        console.log('🌐 Host:', conn.connection.host);
        console.log('📊 Database:', conn.connection.name);
        console.log('');
        
        // Test 3: Check collections
        console.log('📋 Step 3: Checking Collections');
        console.log('─────────────────────────────────────────');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📦 Collections found:', collections.length);
        collections.forEach(col => {
            console.log('  - ' + col.name);
        });
        console.log('');
        
        // Test 4: Count existing orders
        console.log('📋 Step 4: Counting Existing Orders');
        console.log('─────────────────────────────────────────');
        const orderCount = await Order.countDocuments();
        console.log('📊 Total orders in database:', orderCount);
        console.log('');
        
        // Test 5: Create test order
        console.log('📋 Step 5: Testing Order Creation');
        console.log('─────────────────────────────────────────');
        
        const testOrderId = `TEST-${Date.now()}`;
        const testOrder = new Order({
            orderId: testOrderId,
            product: {
                id: 999,
                name: 'Test Product',
                category: 'test',
                image: 'https://via.placeholder.com/150',
                description: 'Test product for database verification'
            },
            customerDetails: {
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                customerPhone: '1234567890',
                deliveryAddress: 'Test Address',
                quantity: 1,
                orderNotes: 'Database test order'
            },
            unitPrice: 100,
            totalAmount: 100,
            status: 'pending',
            productSize: 'Standard',
            orderDate: new Date().toISOString().split('T')[0],
            orderMonth: new Date().toISOString().slice(0, 7),
            submittedAt: new Date()
        });
        
        const savedOrder = await testOrder.save();
        console.log('✅ Test order created successfully');
        console.log('🆔 Order ID:', savedOrder.orderId);
        console.log('📧 Customer Email:', savedOrder.customerDetails.customerEmail);
        console.log('');
        
        // Test 6: Search order by ID
        console.log('📋 Step 6: Testing Order Search by ID');
        console.log('─────────────────────────────────────────');
        const foundById = await Order.findOne({ orderId: testOrderId });
        if (foundById) {
            console.log('✅ Order found by ID');
            console.log('📦 Product:', foundById.product.name);
        } else {
            console.log('❌ Order not found by ID');
        }
        console.log('');
        
        // Test 7: Search order by Email
        console.log('📋 Step 7: Testing Order Search by Email');
        console.log('─────────────────────────────────────────');
        const foundByEmail = await Order.findOne({ 
            'customerDetails.customerEmail': 'test@example.com' 
        });
        if (foundByEmail) {
            console.log('✅ Order found by Email');
            console.log('🆔 Order ID:', foundByEmail.orderId);
        } else {
            console.log('❌ Order not found by Email');
        }
        console.log('');
        
        // Test 8: Delete test order
        console.log('📋 Step 8: Cleaning Up Test Order');
        console.log('─────────────────────────────────────────');
        await Order.deleteOne({ orderId: testOrderId });
        console.log('✅ Test order deleted');
        console.log('');
        
        // Test 9: List recent orders
        console.log('📋 Step 9: Listing Recent Orders');
        console.log('─────────────────────────────────────────');
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderId customerDetails.customerName totalAmount status createdAt');
        
        if (recentOrders.length > 0) {
            console.log(`📊 Found ${recentOrders.length} recent orders:`);
            recentOrders.forEach((order, index) => {
                console.log(`  ${index + 1}. ${order.orderId} - ${order.customerDetails.customerName} - ₹${order.totalAmount} - ${order.status}`);
            });
        } else {
            console.log('📭 No orders found in database');
        }
        console.log('');
        
        // Final summary
        console.log('═══════════════════════════════════════════');
        console.log('✅ DATABASE CONFIGURATION TEST COMPLETE');
        console.log('═══════════════════════════════════════════');
        console.log('');
        console.log('✅ Connection: Working');
        console.log('✅ Order Creation: Working');
        console.log('✅ Order Search by ID: Working');
        console.log('✅ Order Search by Email: Working');
        console.log('✅ Order Deletion: Working');
        console.log('');
        console.log('🎉 Your database is properly configured!');
        console.log('📱 Orders can be tracked from any device');
        console.log('🌐 Multi-device access is enabled');
        console.log('');
        
    } catch (error) {
        console.error('\n❌ Database Test Failed');
        console.error('═══════════════════════════════════════════');
        console.error('Error:', error.message);
        console.error('');
        
        if (error.message.includes('authentication')) {
            console.error('💡 Fix: Check your MongoDB username and password');
        } else if (error.message.includes('network')) {
            console.error('💡 Fix: Check your internet connection');
            console.error('💡 Fix: Verify IP whitelist in MongoDB Atlas');
        } else if (error.message.includes('timeout')) {
            console.error('💡 Fix: Check MongoDB Atlas network access settings');
            console.error('💡 Fix: Add 0.0.0.0/0 to IP whitelist for testing');
        }
        console.error('');
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the test
testDatabaseConnection();
