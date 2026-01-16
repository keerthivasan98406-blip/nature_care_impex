# Quick Database Test

## 🧪 Test Your Database Configuration

### Run the test script:

```bash
cd server
node test-database.js
```

## ✅ Expected Output:

```
🔍 Testing Database Configuration...

📋 Step 1: Checking Environment Variables
─────────────────────────────────────────
✅ MONGODB_ATLAS_URI found
🔗 Connection String: mongodb+srv://p59050352_db_user:****@cluster0.boime9a.mongodb.net/...

📋 Step 2: Connecting to MongoDB Atlas
─────────────────────────────────────────
✅ Connected to MongoDB Atlas
🌐 Host: cluster0-shard-00-00.boime9a.mongodb.net
📊 Database: nature_care_impex

📋 Step 3: Checking Collections
─────────────────────────────────────────
📦 Collections found: 2
  - orders
  - products

📋 Step 4: Counting Existing Orders
─────────────────────────────────────────
📊 Total orders in database: X

📋 Step 5: Testing Order Creation
─────────────────────────────────────────
✅ Test order created successfully
🆔 Order ID: TEST-1737024000000
📧 Customer Email: test@example.com

📋 Step 6: Testing Order Search by ID
─────────────────────────────────────────
✅ Order found by ID
📦 Product: Test Product

📋 Step 7: Testing Order Search by Email
─────────────────────────────────────────
✅ Order found by Email
🆔 Order ID: TEST-1737024000000

📋 Step 8: Cleaning Up Test Order
─────────────────────────────────────────
✅ Test order deleted

📋 Step 9: Listing Recent Orders
─────────────────────────────────────────
📊 Found X recent orders:
  1. NCI-20250116-XXXX - Customer Name - ₹500 - pending
  2. NCI-20250116-YYYY - Customer Name - ₹750 - screenshot

═══════════════════════════════════════════
✅ DATABASE CONFIGURATION TEST COMPLETE
═══════════════════════════════════════════

✅ Connection: Working
✅ Order Creation: Working
✅ Order Search by ID: Working
✅ Order Search by Email: Working
✅ Order Deletion: Working

🎉 Your database is properly configured!
📱 Orders can be tracked from any device
🌐 Multi-device access is enabled
```

## ❌ If Test Fails:

### Error: "Authentication failed"
```bash
# Fix: Check MongoDB Atlas credentials
# 1. Go to MongoDB Atlas → Database Access
# 2. Verify username and password
# 3. Update server/.env file
```

### Error: "Network timeout"
```bash
# Fix: Whitelist IP address
# 1. Go to MongoDB Atlas → Network Access
# 2. Add IP: 0.0.0.0/0
# 3. Wait 2-3 minutes
```

### Error: "MONGODB_ATLAS_URI not found"
```bash
# Fix: Check .env file
# 1. Verify server/.env exists
# 2. Check MONGODB_ATLAS_URI is set
# 3. No spaces or quotes around value
```

## 🔧 Quick Fixes:

### 1. Verify .env file:
```bash
cd server
cat .env | grep MONGODB_ATLAS_URI
```

### 2. Test connection manually:
```bash
cd server
npm start
# Look for: "✅ MongoDB Atlas Connected"
```

### 3. Check MongoDB Atlas:
- Go to: https://cloud.mongodb.com
- Verify cluster is active
- Check Network Access settings
- Verify Database User exists

## 📊 View Orders in Database:

1. Go to: https://cloud.mongodb.com
2. Click: Browse Collections
3. Select: nature_care_impex → orders
4. See all orders stored in database

## ✅ Success = All 9 steps pass!

Your database is ready for multi-device order tracking.
