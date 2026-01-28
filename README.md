# Nature Care Impex - Complete E-commerce Website

A modern, responsive website for Nature Care Impex with integrated owner portal and payment system.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start the Server
```bash
npm start
```

The website will be available at:
- **Main Website**: http://localhost:3000
- **Owner Portal**: http://localhost:3000/owner.html

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

### Owner Portal (`/owner.html`)
- **Login**: Username: `admin`, Password: `nature2024`
- **Order Management** - View all orders with screenshots
- **Product Management** - Add/edit products and inventory
- **Sales Analytics** - Monthly sales and profit tracking
- **Status Updates** - Change order status workflow

## 📱 Mobile Responsive
- Works on all devices and screen sizes
- Touch-friendly navigation and interactions
- Optimized for mobile commerce

## 🔧 Technical Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express (for serving)
- **Storage**: LocalStorage (for demo purposes)
- **Payments**: UPI integration with QR codes
- **Images**: Cloudinary CDN

## 📂 File Structure
```
├── index.html              # Homepage
├── owner.html              # Owner portal
├── products.html           # Products catalog
├── about.html              # About page
├── contact.html            # Contact page
├── product-detail.html     # Product details
├── style (1).css           # Main stylesheet
├── script (12) (1).js      # Main JavaScript
├── owner-portal.css        # Owner portal styles
├── owner-portal.js         # Owner portal functionality
├── server.js               # Express server
└── package.json            # NPM configuration
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

---

**Ready to use!** Just run `npm start` and your complete e-commerce website with owner portal will be live!