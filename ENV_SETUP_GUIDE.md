# 🔧 Environment Variables Setup Guide

## 📋 **Quick Setup**

### **Step 1: Copy Environment File**
```bash
# Copy the template
cp .env.example .env
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Update .env File**
Open `.env` file and update the values according to your setup.

## 🔑 **Essential Variables**

### **Database Configuration**
```env
# For MongoDB Atlas (Cloud)
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# For Local MongoDB
MONGODB_LOCAL_URI=mongodb://localhost:27017/nature_care_impex
```

### **Server Configuration**
```env
NODE_ENV=development
PORT=3000
HOST=localhost
```

### **Owner Portal Credentials**
```env
OWNER_USERNAME=admin
OWNER_PASSWORD=2025
```

## 🌐 **Database Setup Options**

### **Option 1: MongoDB Atlas (Cloud) - Recommended**
1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Follow the setup wizard
3. **Get Connection String**: 
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>`
4. **Update .env**:
   ```env
   MONGODB_ATLAS_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/nature_care_impex
   ```

### **Option 2: Local MongoDB**
1. **Install MongoDB**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. **Start MongoDB Service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. **Update .env**:
   ```env
   MONGODB_LOCAL_URI=mongodb://localhost:27017/nature_care_impex
   ```

## 📧 **Email Configuration (Optional)**

For order notifications and contact forms:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Gmail Setup:**
1. Enable 2-factor authentication
2. Generate app password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASS`

## 💳 **Payment Gateway (Optional)**

### **Razorpay (Indian Market)**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your-secret-key
```

### **PayPal (International)**
```env
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox
```

## 🖼️ **Image Storage (Optional)**

### **Cloudinary (Recommended)**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **AWS S3**
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## 🔒 **Security Settings**

```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
SESSION_SECRET=your-session-secret-key-min-32-characters
```

**Generate secure secrets:**
```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 **Production Settings**

### **Environment**
```env
NODE_ENV=production
PORT=80
HOST=your-domain.com
```

### **CORS Origins**
```env
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### **SSL Configuration**
```env
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/certificate.crt
SSL_KEY_PATH=/path/to/private.key
```

## 📊 **Feature Flags**

Enable/disable features:
```env
ENABLE_USER_REGISTRATION=false
ENABLE_GUEST_CHECKOUT=true
ENABLE_INVENTORY_TRACKING=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
```

## 🔍 **Debugging**

```env
DEBUG=true
LOG_LEVEL=debug
CONSOLE_LOGGING=true
ENABLE_TEST_ROUTES=true
```

## 📝 **Business Configuration**

```env
COMPANY_NAME=Nature Care Impex
COMPANY_EMAIL=info@naturecareimpex.com
COMPANY_PHONE=+91-XXXXXXXXXX
COMPANY_ADDRESS=Your Business Address Here
```

## 🔄 **Testing Your Setup**

### **1. Start Server**
```bash
npm start
```

### **2. Check Health**
```bash
curl http://localhost:3000/api/health
```

### **3. Test Database**
Open: http://localhost:3000/test-database-connection.html

### **4. Test Owner Portal**
1. Open: http://localhost:3000/owner.html
2. Login with credentials from .env file
3. Test adding/editing/deleting products

## ⚠️ **Important Notes**

### **Security**
- ✅ **Never commit .env file** to version control
- ✅ **Use strong passwords** and secrets
- ✅ **Rotate secrets regularly** in production
- ✅ **Use HTTPS** in production

### **Database**
- ✅ **Backup regularly** in production
- ✅ **Monitor connection limits**
- ✅ **Use connection pooling**

### **Performance**
- ✅ **Enable caching** in production
- ✅ **Use CDN** for static assets
- ✅ **Monitor resource usage**

## 🆘 **Troubleshooting**

### **Database Connection Issues**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Check connection string format
# mongodb://localhost:27017/database_name (local)
# mongodb+srv://user:pass@cluster.net/database_name (atlas)
```

### **Environment Variables Not Loading**
```bash
# Check if .env file exists
ls -la .env

# Check if dotenv is installed
npm list dotenv

# Restart server after changes
npm start
```

### **Port Already in Use**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (Mac/Linux)
kill -9 <process_id>
```

## 📚 **Additional Resources**

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

## 🎯 **Quick Start Checklist**

- [ ] Copy `.env.example` to `.env`
- [ ] Update database connection string
- [ ] Set owner portal credentials
- [ ] Install dependencies (`npm install`)
- [ ] Start server (`npm start`)
- [ ] Test health endpoint
- [ ] Test owner portal login
- [ ] Test product management

**Your environment is now configured!** 🎉