const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Get connection strings from environment variables
        const atlasUri = process.env.MONGODB_ATLAS_URI;
        const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/nature_care_impex';
        const connectionTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000;
        
        console.log('🔄 Attempting to connect to MongoDB...');
        
        // Try MongoDB Atlas first if URI is provided
        if (atlasUri && atlasUri !== 'mongodb+srv://username:password@cluster.mongodb.net/database_name') {
            try {
                console.log('🌐 Trying MongoDB Atlas...');
                const conn = await mongoose.connect(atlasUri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: connectionTimeout,
                    ssl: true,
                    tlsAllowInvalidCertificates: true,
                    tlsAllowInvalidHostnames: true,
                    retryWrites: true,
                    w: 'majority'
                });

                console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
                console.log(`📊 Database: ${conn.connection.name}`);
                return conn;
            } catch (error) {
                console.error('❌ MongoDB Atlas connection error:', error.message);
                console.log('💡 Tip: Check your IP whitelist and connection string');
            }
        }
        
        // Try local MongoDB as fallback
        try {
            console.log('🏠 Trying local MongoDB...');
            const localConn = await mongoose.connect(localUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 3000,
            });
            
            console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
            console.log(`📊 Database: ${localConn.connection.name}`);
            return localConn;
        } catch (localError) {
            console.error('❌ Local MongoDB connection error:', localError.message);
            console.log('⚠️ Running without database - API will use fallback responses');
            console.log('💡 Install MongoDB locally or check your connection string');
            
            // Don't exit the process, let the server run without database
            // The API routes will handle the database unavailability
            return null;
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return null;
    }
};

module.exports = connectDB;