# 🌱 Nature Care Impex - E-commerce Platform

A modern, full-stack e-commerce website for Nature Care Impex with integrated owner portal, payment system, and MongoDB database.

## 🌐 Live Demo
- **GitHub Pages Demo**: [View Static Demo](https://yourusername.github.io/repository-name)
- **Full Version**: Requires Node.js server (see deployment section)

## 🚀 Quick Start

### For GitHub Pages Demo (Static Version):
1. Upload these files to GitHub:
   - `index.html`, `products.html`, `about.html`, `contact.html`, `track-order.html`
   - `css/` folder
   - `js/` folder
   - `assets/` folder
2. Enable GitHub Pages in repository settings
3. Access at: `https://yourusername.github.io/repository-name`

### For Full Version (Local Development):

#### Install Dependencies
```bash
cd server
npm install
```

#### Start the Server
```bash
npm start
```

The website will be available at:
- **Main Website**: http://localhost:3000
- **Owner Portal**: http://localhost:3000/owner
- **API Health**: http://localhost:3000/api/health

## 📋 Available Scripts

- `npm start` - Start the Express server
- `npm run dev` - Start development server with live reload
- `npm run serve` - Alternative server on port 8080
- `npm run owner` - Open owner portal directly
- `npm run build` - Build info (static files ready)

## 🌐 Website Features

### Main Website
- **Homepage** - Hero carousel, featured products, sustainability highlights
- **Products** - Product catalog with Buy Now functionality
- **About** - Company story and sustainability promise
- **Contact** - Contact form and location details
- **Product Details** - Individual product pages

### E-commerce System
- **Buy Now Flow** - Complete ordering process
- **Order Details Form** - Customer information collection
- **Payment Integration** - UPI payments with QR codes
- **Screenshot Upload** - Payment proof system
- **Order Confirmation** - Success notifications

### Owner Portal (`/owner`)
- **Login**: Username: `admin`, Password: `2025`
- **Order Management** - View all orders with screenshots
- **Product Management** - Add/edit products and inventory
- **Sales Analytics** - Monthly sales and profit tracking
- **Status Updates** - Change order status workflow
- **Real-time Dashboard** - Business statistics and metrics

## 📱 Mobile Responsive
- Works on all devices and screen sizes
- Touch-friendly navigation and interactions
- Optimized for mobile commerce

## 🔧 Technical Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas (Cloud) / Local MongoDB
- **Storage**: Base64 encoding for images
- **Payments**: UPI integration with QR codes
- **Images**: Cloudinary CDN
- **Deployment**: Render.com, Railway.app, or GitHub Pages (demo)

## 📂 File Structure
```
nature-care-impex/
├── index.html              # Homepage (root for GitHub Pages)
├── products.html           # Products catalog
├── about.html              # About page
├── contact.html            # Contact page
├── track-order.html        # Order tracking
├── css/
│   ├── main.css           # Main stylesheet
│   ├── owner-portal.css   # Owner portal styles
│   └── combined-styles.css
├── js/
│   ├── main.js            # Main JavaScript
│   ├── api-service.js     # API integration
│   ├── owner-portal.js    # Owner portal functionality
│   └── github-pages-fallback.js  # Demo fallback
├── assets/
│   └── images/            # Product images
├── html/                  # Original HTML files (for server)
│   ├── index.html
│   ├── products.html
│   ├── owner.html
│   └── ...
├── server/                # Backend (Node.js + Express)
│   ├── server.js          # Express server
│   ├── package.json       # Dependencies
│   ├── .env               # Environment variables (DO NOT COMMIT)
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   ├── models/
│   │   ├── Order.js       # Order schema
│   │   └── Product.js     # Product schema
│   └── routes/
│       ├── orders.js      # Order API routes
│       └── products.js    # Product API routes
├── README.md              # This file
├── GITHUB_PAGES_README.md # GitHub Pages guide
└── .gitignore             # Git ignore file
```

## 🛒 Order Flow
1. Customer clicks "Buy Now" on any product
2. Fills order details form (name, address, quantity)
3. Proceeds to payment with UPI QR code
4. Uploads payment screenshot
5. Confirms order
6. Order appears in owner portal with "📷 screenshot" status
7. Owner can view screenshot and update order status

## 👤 Owner Portal Features
- **Dashboard** - Business overview and statistics
- **Order Management** - All orders with screenshot viewing
- **Product Management** - Add/edit products and pricing
- **Monthly Sales** - Revenue and profit analysis
- **Inventory** - Stock levels and alerts
- **Status Updates** - Order workflow management

## 🔐 Security Features
- Owner portal login protection
- Screenshot validation
- Input sanitization
- Secure file handling

## 🌱 Sustainability Focus
- Eco-friendly product showcase
- Sustainable business practices
- Environmental impact messaging
- Green technology integration

## 🚀 Deployment Options

### Option 1: GitHub Pages (Static Demo)
**Best for**: Portfolio, demo, showcase

**Features**:
- ✅ Free hosting
- ✅ Fast and reliable
- ✅ Custom domain support
- ❌ No database (static products only)
- ❌ No real order processing
- ❌ No owner portal functionality

**Steps**:
1. Upload files to GitHub repository
2. Enable GitHub Pages in Settings
3. Access at: `https://yourusername.github.io/repository-name`

**Files to Upload**:
- `index.html`, `products.html`, `about.html`, `contact.html`, `track-order.html`
- `css/` folder
- `js/` folder
- `assets/` folder
- `README.md`, `.gitignore`

**Don't Upload**:
- `server/` folder (contains passwords)
- `html/` folder (files moved to root)
- `.env` file

---

### Option 2: Render.com (Full Stack)
**Best for**: Production deployment with full functionality

**Features**:
- ✅ Full database integration
- ✅ Real order processing
- ✅ Owner portal
- ✅ Payment system
- ✅ Free tier available

### Prerequisites
- GitHub repository with this project
- MongoDB Atlas account with connection URI
- Render.com account

### Steps to Deploy

1. **Prepare MongoDB Atlas:**
   - Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a cluster
   - Get connection string
   - Whitelist IP: `0.0.0.0/0` (allow all)

2. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Create Render Service:**
   - Sign up at [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy

4. **Configure Render:**
   - **Name**: `nature-care-impex`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

5. **Set Environment Variables:**
   Go to "Environment" tab and add:
   ```
   MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/nature_care_impex
   NODE_ENV=production
   PORT=10000
   OWNER_USERNAME=admin
   OWNER_PASSWORD=2025
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be live at: `https://nature-care-impex.onrender.com`

### After Deployment
- **Main Website**: `https://your-app.onrender.com`
- **Owner Portal**: `https://your-app.onrender.com/owner`
- **API**: `https://your-app.onrender.com/api/health`

### Important Notes
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to paid plan ($7/month) for always-on availability
- Database on MongoDB Atlas (free tier: 512MB)

---

### Option 3: Railway.app (Alternative)
Similar to Render, with automatic deployments from GitHub.

1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

## 📞 Contact Information

- **Email**: naturecareimpex@gmail.com
- **Phone**: 9345540373
- **Address**: Shop 11A bajar street, kottakuppam, vanur taluk, villupuram district, tamilnadu, 605104
- **GSTIN**: 33AAYFN7568G

---

## 📄 License

This project is proprietary software owned by Nature Care Impex.

---

**🌱 Nature Care Impex - Sustainable Solutions for a Better Tomorrow**

*For inquiries about custom e-commerce solutions or deployment assistance, contact us at naturecareimpex@gmail.com*