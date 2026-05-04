const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function clearProducts() {
    console.log('\n🔍 Connecting to Database to clear products...\n');
    
    try {
        const atlasUri = process.env.MONGODB_ATLAS_URI;
        if (!atlasUri) {
            console.log('❌ MONGODB_ATLAS_URI not found in .env file');
            return;
        }
        
        await mongoose.connect(atlasUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            ssl: true,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✅ Connected to MongoDB Atlas');
        
        const result = await Product.deleteMany({});
        console.log(`✅ Successfully deleted ${result.deletedCount} products from the database.`);
        
    } catch (error) {
        console.error('❌ Error clearing products:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

clearProducts();
