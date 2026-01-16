/* Owner Portal JavaScript */

// Login credentials (in real app, this would be server-side)
const CREDENTIALS = {
    username: 'admin',
    password: '2025'
};

// Sample data
let orders = [
    {
        id: 'ORD-001',
        date: '2024-01-05',
        customer: 'Green Gardens Ltd',
        email: 'contact@greengardens.com',
        product: 'Cocopeat 5kg Block',
        quantity: 100,
        unitPrice: 250,
        amount: 25000,
        status: 'pending',
        notes: 'Urgent delivery required'
    },
    {
        id: 'ORD-002',
        date: '2024-01-04',
        customer: 'Eco Farms',
        email: 'orders@ecofarms.in',
        product: 'Coco Grow Bags',
        quantity: 200,
        unitPrice: 90,
        amount: 18000,
        status: 'completed',
        notes: 'Regular customer'
    },
    {
        id: 'ORD-003',
        date: '2024-01-03',
        customer: 'Nature Plus',
        email: 'info@natureplus.com',
        product: 'Bamboo Period Pads',
        quantity: 50,
        unitPrice: 120,
        amount: 6000,
        status: 'shipped',
        notes: 'First time buyer'
    }
];

let products = [
    {
        id: 'cocopeat-5kg',
        name: 'Cocopeat 5kg Block',
        category: 'cocopeat',
        description: 'Premium washed cocopeat blocks ideal for potting mixes',
        price: 250,
        cost: 150,
        stock: 450,
        minStock: 100,
        image: 'https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190898/photo_2025-12-31_22-18-07_c2hs4m.jpg'
    },
    {
        id: 'grow-bags',
        name: 'Coco Grow Bags',
        category: 'eco-care',
        description: 'Ready-to-use grow bags for greenhouse cultivation',
        price: 90,
        cost: 55,
        stock: 800,
        minStock: 200,
        image: 'https://cdn.moglix.com/p/B5wXshH1wq7TS-xxlarge.jpg'
    },
    {
        id: 'bamboo-pads',
        name: 'Bamboo Period Pads',
        category: 'bamboo',
        description: 'Eco-friendly bamboo period pads',
        price: 120,
        cost: 70,
        stock: 200,
        minStock: 50,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbYHHF-lKgdGS9ftR4AwALD27xwGSO9hsldw&s'
    }
];

let monthlyData = [
    { month: 'Jan', sales: 245000, costs: 147000, profit: 98000, orders: 42 },
    { month: 'Feb', sales: 220000, costs: 132000, profit: 88000, orders: 38 },
    { month: 'Mar', sales: 280000, costs: 168000, profit: 112000, orders: 48 },
    { month: 'Apr', sales: 195000, costs: 117000, profit: 78000, orders: 35 },
    { month: 'May', sales: 310000, costs: 186000, profit: 124000, orders: 52 },
    { month: 'Jun', sales: 275000, costs: 165000, profit: 110000, orders: 46 },
    { month: 'Jul', sales: 290000, costs: 174000, profit: 116000, orders: 49 },
    { month: 'Aug', sales: 320000, costs: 192000, profit: 128000, orders: 55 },
    { month: 'Sep', sales: 285000, costs: 171000, profit: 114000, orders: 47 },
    { month: 'Oct', sales: 305000, costs: 183000, profit: 122000, orders: 51 },
    { month: 'Nov', sales: 340000, costs: 204000, profit: 136000, orders: 58 },
    { month: 'Dec', sales: 365000, costs: 219000, profit: 146000, orders: 62 }
];

document.addEventListener('DOMContentLoaded', function() {
    initializePortal();
});

function initializePortal() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const navItems = document.querySelectorAll('.nav-item');

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation handlers
    navItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Form handlers
    setupFormHandlers();

    // Check if already logged in
    checkLoginStatus();
}

function setupFormHandlers() {
    // Add Order Form
    const addOrderForm = document.getElementById('add-order-form');
    if (addOrderForm) {
        addOrderForm.addEventListener('submit', handleAddOrder);
        
        // Auto-calculate total amount
        const quantityInput = document.getElementById('order-quantity');
        const priceInput = document.getElementById('unit-price');
        const totalInput = document.getElementById('total-amount');
        
        function calculateTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            totalInput.value = (quantity * price).toFixed(2);
        }
        
        quantityInput.addEventListener('input', calculateTotal);
        priceInput.addEventListener('input', calculateTotal);
    }

    // Add Product Form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
        
        // Image preview handlers
        const imageUrlInput = document.getElementById('product-image-url');
        const imageFileInput = document.getElementById('product-image-file');
        
        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', function() {
                if (this.value) {
                    showImagePreview(this.value);
                    // Clear file input when URL is entered
                    if (imageFileInput) imageFileInput.value = '';
                }
            });
        }
        
        if (imageFileInput) {
            imageFileInput.addEventListener('change', async function() {
                if (this.files[0]) {
                    try {
                        const base64 = await convertFileToBase64(this.files[0]);
                        showImagePreview(base64);
                        // Clear URL input when file is selected
                        if (imageUrlInput) imageUrlInput.value = '';
                    } catch (error) {
                        console.error('Error converting file:', error);
                        showNotification('Error processing image file', 'error');
                    }
                }
            });
        }
    }

    // Order Filter
    const orderFilter = document.getElementById('order-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', filterOrders);
    }
}

// Enhanced handleLogin function with async support
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        localStorage.setItem('ownerLoggedIn', 'true');
        await showDashboard();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials. Please try again.', 'error');
        document.getElementById('password').value = '';
    }
}

function handleLogout() {
    localStorage.removeItem('ownerLoggedIn');
    showLoginScreen();
    showNotification('Logged out successfully.', 'info');
}

// Enhanced handleNavigation function with async support
async function handleNavigation(e) {
    e.preventDefault();
    
    const targetSection = e.target.getAttribute('data-section');
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Show target section
    await showSection(targetSection);
}

// Enhanced showSection function with async support
async function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionName) {
            case 'orders':
                await loadOrders();
                break;
            case 'products':
                await loadProducts();
                break;
            case 'sales':
                loadSalesData();
                break;
        }
    }
}

// Enhanced checkLoginStatus function with async support
async function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('ownerLoggedIn') === 'true';
    
    if (isLoggedIn) {
        await showDashboard();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    const backButton = document.getElementById('back-button');
    if (backButton) backButton.style.display = 'none';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Enhanced showDashboard function with MongoDB integration
async function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'grid';
    const backButton = document.getElementById('back-button');
    if (backButton) backButton.style.display = 'flex';
    
    // Load dashboard data with MongoDB integration
    await loadDashboardData();
    
    // Also load orders immediately to ensure they're available
    console.log('Dashboard loaded, loading orders...');
    await loadOrders();
}

// Enhanced loadDashboardData function with MongoDB integration
async function loadDashboardData() {
    try {
        console.log('🔄 Loading dashboard data...');
        
        // Load products from MongoDB first
        if (window.apiService) {
            try {
                const result = await window.apiService.getProducts();
                if (result.success && result.data) {
                    // Clear and update local products array with database data
                    products.length = 0;
                    products.push(...result.data);
                    console.log('✅ Products loaded from MongoDB for dashboard:', products.length);
                } else {
                    console.log('⚠️ MongoDB load failed, using local products');
                }
            } catch (error) {
                console.log('⚠️ MongoDB unavailable, using local products:', error.message);
            }
        }
        
        // Sync products to main site
        await syncProductsToMainSite();
        
        // Load orders and calculate statistics
        const adminOrders = orders;
        const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        const allOrders = [...adminOrders, ...customerOrders.map(order => ({
            amount: order.totalAmount || order.customerDetails?.total || 0,
            status: order.status || 'pending',
            date: order.createdAt || order.timestamp || new Date().toISOString()
        }))];
        
        // Update real-time statistics
        updateRealTimeStats(allOrders);
        
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showNotification('Error loading dashboard data: ' + error.message, 'error');
    }
}

// Update real-time statistics
function updateRealTimeStats(allOrders) {
    try {
        // Set up periodic updates (every 30 seconds)
        setInterval(() => {
            const refreshedCustomerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
            const refreshedAllOrders = [...adminOrders, ...refreshedCustomerOrders.map(order => ({
                amount: order.totalAmount || order.customerDetails?.total || 0,
                status: order.paymentScreenshot ? 'screenshot' : (order.status || 'pending'),
                date: order.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                orderMonth: order.orderMonth || order.createdAt?.slice(0, 7) || new Date().toISOString().slice(0, 7)
            }))];
            updateRealTimeStats(refreshedAllOrders);
            updateRecentActivity();
        }, 30000);
    } catch (error) {
        console.error('Error in updateRealTimeStats:', error);
    }
}

function updateStats() {
    const stats = {
        orders: orders.length,
        revenue: orders.reduce((sum, order) => sum + order.amount, 0),
        products: products.length,
        pending: orders.filter(order => order.status === 'pending').length
    };
    
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = stats.orders;
        statNumbers[1].textContent = '₹' + stats.revenue.toLocaleString();
        statNumbers[2].textContent = stats.products;
        statNumbers[3].textContent = stats.pending;
    }
}

function updateRecentActivity() {
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    
    // Get the 3 most recent orders
    const recentOrders = customerOrders
        .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
        .slice(0, 3);
    
    let activities = [];
    
    if (recentOrders.length > 0) {
        activities = recentOrders.map(order => {
            const timeAgo = getTimeAgo(order.createdAt || order.timestamp);
            const customerName = order.customerDetails?.customerName || order.customerDetails?.name || 'Customer';
            const productName = order.product?.name || 'Product';
            const quantity = order.customerDetails?.quantity || 1;
            const amount = order.totalAmount || order.customerDetails?.total || 0;
            
            return {
                time: timeAgo,
                text: `New order from ${customerName} - ${productName} (Qty: ${quantity}) - ₹${amount.toLocaleString()}`
            };
        });
    } else {
        // Fallback to default activities if no orders
        activities = [
            {
                time: '2 hours ago',
                text: 'System ready - Waiting for new orders'
            },
            {
                time: '5 hours ago',
                text: 'Owner portal accessed'
            },
            {
                time: '1 day ago',
                text: 'System initialized'
            }
        ];
    }
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-time">${activity.time}</span>
                <span class="activity-text">${activity.text}</span>
            </div>
        `).join('');
    }
}

function getTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
}

// Order Management Functions
// Enhanced loadOrders function with MongoDB integration
async function loadOrders() {
    console.log('loadOrders called');
    
    try {
        let allOrders = [];
        
        // Try to load from MongoDB first
        if (window.apiService) {
            try {
                const result = await window.apiService.getOrders();
                if (result.success && result.data) {
                    console.log('✅ Orders loaded from MongoDB:', result.data.length);
                    
                    // Convert MongoDB orders to display format
                    allOrders = result.data.map(order => ({
                        id: order.orderId,
                        date: order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                        customer: order.customerDetails?.customerName || 'Unknown Customer',
                        email: order.customerDetails?.customerEmail || 'No email',
                        product: order.product?.name || 'Unknown Product',
                        productSize: order.productSize || 'Not specified',
                        quantity: order.customerDetails?.quantity || 1,
                        unitPrice: order.unitPrice || 0,
                        amount: order.totalAmount || 0,
                        status: order.status || 'pending',
                        notes: order.customerDetails?.orderNotes || '',
                        source: 'customer',
                        hasScreenshot: !!order.paymentScreenshot,
                        screenshot: order.paymentScreenshot?.dataUrl,
                        phone: order.customerDetails?.customerPhone || 'No phone',
                        address: order.customerDetails?.deliveryAddress || 'No address',
                        orderMonth: order.orderMonth || order.createdAt?.slice(0, 7) || new Date().toISOString().slice(0, 7)
                    }));
                } else {
                    console.log('⚠️ MongoDB load failed, using localStorage fallback');
                }
            } catch (error) {
                console.log('⚠️ MongoDB unavailable, using localStorage fallback:', error.message);
            }
        }
        
        // Fallback: Load from localStorage if MongoDB failed
        if (allOrders.length === 0) {
            // Load both admin orders and customer orders
            const adminOrders = orders;
            const customerOrdersRaw = localStorage.getItem('customerOrders');
            console.log('Raw customer orders from localStorage:', customerOrdersRaw);
            
            const customerOrders = JSON.parse(customerOrdersRaw || '[]');
            console.log('Parsed customer orders:', customerOrders);
            console.log('Number of customer orders:', customerOrders.length);
            
            // Combine and format orders
            allOrders = [
                ...adminOrders.map(order => ({
                    ...order,
                    source: 'admin',
                    hasScreenshot: false,
                    productSize: order.productSize || 'Not specified'
                })),
                ...customerOrders.map(order => {
                    const customerName = order.customerDetails?.name || order.customerDetails?.customerName || 'Unknown Customer';
                    const customerEmail = order.customerDetails?.email || order.customerDetails?.customerEmail || 'No email';
                    const customerPhone = order.customerDetails?.phone || order.customerDetails?.customerPhone || 'No phone';
                    const customerAddress = order.customerDetails?.address || order.customerDetails?.deliveryAddress || 'No address';
                    const orderTotal = order.totalAmount || order.customerDetails?.total || 0;
                    const orderQuantity = order.customerDetails?.quantity || 1;
                    const productSize = order.productSize || order.customerDetails?.productSize || 'Not specified';
                    
                    return {
                        id: order.orderId,
                        date: order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                        customer: customerName,
                        email: customerEmail,
                        product: order.product?.name || 'Unknown Product',
                        productSize: productSize,
                        quantity: orderQuantity,
                        unitPrice: orderTotal / orderQuantity,
                        amount: orderTotal,
                        status: order.paymentScreenshot ? 'screenshot' : (order.status || 'pending'),
                        notes: order.customerDetails?.notes || order.customerDetails?.orderNotes || '',
                        source: 'customer',
                        hasScreenshot: !!order.paymentScreenshot,
                        screenshot: order.paymentScreenshot?.dataUrl || order.paymentScreenshot,
                        phone: customerPhone,
                        address: customerAddress,
                        orderMonth: order.orderMonth || order.createdAt?.slice(0, 7) || new Date().toISOString().slice(0, 7)
                    };
                })
            ];
        }
        
        console.log('All orders combined:', allOrders);
        console.log('Total orders:', allOrders.length);
        
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) {
            console.error('orders-tbody element not found!');
            return;
        }
        
        console.log('Rendering orders to table...');
        
        tbody.innerHTML = allOrders.map(order => `
            <tr class="${order.source === 'customer' ? 'customer-order' : ''}">
                <td>
                    <strong>${order.id}</strong>
                    <br><small style="color: #666;">${order.date}</small>
                </td>
                <td>
                    <strong>${order.customer}</strong>
                    ${order.source === 'customer' ? '<span class="order-badge">Online</span>' : ''}
                    <br><small style="color: #666;">${order.email || 'No email'}</small>
                    ${order.phone ? `<br><small style="color: #666;">📞 ${order.phone}</small>` : ''}
                </td>
                <td>
                    <strong>${order.product}</strong>
                    ${order.productSize !== 'Not specified' ? `<br><small style="color: #666;">Size: ${order.productSize}</small>` : ''}
                    <br><small style="color: #666;">Qty: ${order.quantity} × ₹${Math.round(order.unitPrice || 0).toLocaleString()}</small>
                </td>
                <td>
                    <strong>₹${order.amount.toLocaleString()}</strong>
                    ${order.notes ? `<br><small style="color: #666;" title="${order.notes}">📝 Notes</small>` : ''}
                </td>
                <td>
                    <div class="status-container">
                        ${order.hasScreenshot ? 
                            `<span class="status ${order.status} clickable-status" onclick="viewScreenshot('${order.id}')" title="Click to view payment screenshot">
                                📷 ${order.status}
                            </span>` : 
                            `<span class="status ${order.status}">${order.status}</span>`
                        }
                    </div>
                </td>
                <td>
                    <button class="btn-small" onclick="trackOrder('${order.id}', '${order.source}')" title="Track Order">📦 Track</button>
                    ${order.source === 'customer' ? 
                        `<button class="btn-small" onclick="showOrderDetailsModal({
                            id: '${order.id}',
                            customer: '${order.customer}',
                            email: '${order.email || 'No email'}',
                            phone: '${order.phone || 'No phone'}',
                            address: '${(order.address || 'No address').replace(/'/g, "\\'")}',
                            product: '${order.product}',
                            productSize: '${order.productSize}',
                            quantity: ${order.quantity},
                            unitPrice: ${order.unitPrice || 0},
                            amount: ${order.amount},
                            status: '${order.status}',
                            date: '${order.date}',
                            notes: '${(order.notes || '').replace(/'/g, "\\'")}',
                            hasScreenshot: ${order.hasScreenshot},
                            source: '${order.source}'
                        })" title="View Details">👁️ View</button>` : 
                        `<button class="btn-small" onclick="editOrder('${order.id}')" title="Edit Order">✏️ Edit</button>`
                    }
                    <button class="btn-small btn-danger" onclick="deleteOrder('${order.id}', '${order.source}')" title="Delete Order" style="background: #dc3545; color: white;">🗑️ Delete</button>
                </td>
            </tr>
        `).join('');
        
        console.log('Orders rendered to table');
        updateOrderSummary(allOrders);
        
        // Update dashboard statistics with real data
        updateRealTimeStats(allOrders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const tbody = document.getElementById('orders-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #dc3545;">
                        <h3>Error loading orders</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-secondary" onclick="loadOrders()">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

function updateOrderSummary(allOrders = null) {
    if (!allOrders) {
        const adminOrders = orders;
        const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        allOrders = [
            ...adminOrders, 
            ...customerOrders.map(o => ({ 
                amount: o.customerDetails.total, 
                status: o.paymentScreenshot ? 'screenshot' : (o.status || 'pending'), 
                date: o.createdAt 
            }))
        ];
    }
    
    document.getElementById('total-orders').textContent = allOrders.length;
    
    // Count screenshot orders instead of pending for the summary
    const screenshotOrders = allOrders.filter(o => o.status === 'screenshot').length;
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    const totalPendingAndScreenshot = screenshotOrders + pendingOrders;
    
    document.getElementById('pending-orders').textContent = totalPendingAndScreenshot;
    
    const thisMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('monthly-orders').textContent = allOrders.filter(o => o.date && o.date.startsWith(thisMonth)).length;
    document.getElementById('orders-revenue').textContent = '₹' + allOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString();
}

function trackOrder(orderId, source) {
    console.log('Tracking order:', orderId, 'from source:', source);
    
    // For now, show the order details modal with tracking information
    let order = null;
    
    if (source === 'admin') {
        order = orders.find(o => o.id === orderId);
    } else {
        const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        const customerOrder = customerOrders.find(o => o.orderId === orderId);
        if (customerOrder) {
            order = {
                id: customerOrder.orderId,
                customer: customerOrder.customerDetails.name || customerOrder.customerDetails.customerName,
                email: customerOrder.customerDetails.email || customerOrder.customerDetails.customerEmail,
                phone: customerOrder.customerDetails.phone || customerOrder.customerDetails.customerPhone,
                address: customerOrder.customerDetails.address || customerOrder.customerDetails.deliveryAddress,
                product: customerOrder.product.name,
                productSize: customerOrder.productSize || customerOrder.customerDetails.productSize || 'Not specified',
                quantity: customerOrder.customerDetails.quantity,
                unitPrice: customerOrder.unitPrice || (customerOrder.totalAmount / customerOrder.customerDetails.quantity),
                amount: customerOrder.totalAmount || customerOrder.customerDetails.total,
                notes: customerOrder.customerDetails.notes || customerOrder.customerDetails.orderNotes,
                status: customerOrder.status,
                date: customerOrder.createdAt ? customerOrder.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                source: 'customer',
                hasScreenshot: !!customerOrder.paymentScreenshot
            };
        }
    }
    
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    // Show order tracking modal with enhanced tracking information
    showOrderTrackingModal(order);
}

function showOrderTrackingModal(order) {
    const trackingSteps = getTrackingSteps(order.status);
    
    const modalHTML = `
        <div id="order-tracking-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Order Tracking - ${order.id}</h3>
                    <span class="close" onclick="closeOrderTrackingModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="tracking-info">
                        <div class="order-summary">
                            <h4>Order Summary</h4>
                            <p><strong>Customer:</strong> ${order.customer}</p>
                            <p><strong>Product:</strong> ${order.product}</p>
                            ${order.productSize !== 'Not specified' ? `<p><strong>Size/Variant:</strong> ${order.productSize}</p>` : ''}
                            <p><strong>Quantity:</strong> ${order.quantity}</p>
                            <p><strong>Amount:</strong> ₹${order.amount.toLocaleString()}</p>
                            <p><strong>Order Date:</strong> ${order.date}</p>
                        </div>
                        
                        <div class="tracking-timeline">
                            <h4>Order Status Timeline</h4>
                            <div class="timeline">
                                ${trackingSteps.map(step => `
                                    <div class="timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}">
                                        <div class="step-icon">${step.icon}</div>
                                        <div class="step-content">
                                            <div class="step-title">${step.title}</div>
                                            <div class="step-description">${step.description}</div>
                                            ${step.date ? `<div class="step-date">${step.date}</div>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        ${order.hasScreenshot ? `
                        <div class="tracking-actions">
                            <button class="btn-primary" onclick="viewScreenshot('${order.id}')">View Payment Screenshot</button>
                        </div>
                        ` : ''}
                        
                        ${order.source === 'customer' ? `
                        <div class="status-update">
                            <label for="tracking-status-select"><strong>Update Order Status:</strong></label>
                            <select id="tracking-status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="screenshot" ${order.status === 'screenshot' ? 'selected' : ''}>Payment Received</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('order-tracking-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('order-tracking-modal').style.display = 'block';
}

function getTrackingSteps(currentStatus) {
    const allSteps = [
        {
            id: 'pending',
            title: 'Order Placed',
            description: 'Order has been received and is awaiting payment confirmation',
            icon: '📝',
            completed: true,
            current: currentStatus === 'pending',
            date: 'Order placed'
        },
        {
            id: 'screenshot',
            title: 'Payment Received',
            description: 'Payment screenshot received and being verified',
            icon: '💳',
            completed: ['screenshot', 'processing', 'shipped', 'completed'].includes(currentStatus),
            current: currentStatus === 'screenshot',
            date: currentStatus === 'screenshot' || ['processing', 'shipped', 'completed'].includes(currentStatus) ? 'Payment confirmed' : null
        },
        {
            id: 'processing',
            title: 'Processing',
            description: 'Order is being prepared for shipment',
            icon: '📦',
            completed: ['processing', 'shipped', 'completed'].includes(currentStatus),
            current: currentStatus === 'processing',
            date: currentStatus === 'processing' || ['shipped', 'completed'].includes(currentStatus) ? 'In preparation' : null
        },
        {
            id: 'shipped',
            title: 'Shipped',
            description: 'Order has been dispatched and is on the way',
            icon: '🚚',
            completed: ['shipped', 'completed'].includes(currentStatus),
            current: currentStatus === 'shipped',
            date: currentStatus === 'shipped' || currentStatus === 'completed' ? 'Out for delivery' : null
        },
        {
            id: 'completed',
            title: 'Delivered',
            description: 'Order has been successfully delivered',
            icon: '✅',
            completed: currentStatus === 'completed',
            current: currentStatus === 'completed',
            date: currentStatus === 'completed' ? 'Delivered successfully' : null
        }
    ];
    
    return allSteps;
}

function closeOrderTrackingModal() {
    const modal = document.getElementById('order-tracking-modal');
    if (modal) modal.remove();
}

function viewOrderDetails(orderId, source) {
    let order = null;
    
    if (source === 'admin') {
        order = orders.find(o => o.id === orderId);
    } else {
        const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        const customerOrder = customerOrders.find(o => o.orderId === orderId);
        if (customerOrder) {
            order = {
                id: customerOrder.orderId,
                customer: customerOrder.customerDetails.name,
                email: customerOrder.customerDetails.email,
                phone: customerOrder.customerDetails.phone,
                address: customerOrder.customerDetails.address,
                product: customerOrder.product.name,
                quantity: customerOrder.customerDetails.quantity,
                amount: customerOrder.customerDetails.total,
                notes: customerOrder.customerDetails.notes,
                status: customerOrder.status,
                date: customerOrder.createdAt,
                source: 'customer'
            };
        }
    }
    
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    showOrderDetailsModal(order);
}

function showOrderDetailsModal(order) {
    const modalHTML = `
        <div id="order-details-view-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Order Details - ${order.id}</h3>
                    <span class="close" onclick="closeOrderDetailsView()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-details-grid">
                        <div class="detail-section">
                            <h4>Customer Information</h4>
                            <p><strong>Name:</strong> ${order.customer}</p>
                            <p><strong>Email:</strong> ${order.email}</p>
                            ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
                            ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
                        </div>
                        
                        <div class="detail-section">
                            <h4>Order Information</h4>
                            <p><strong>Product:</strong> ${order.product}</p>
                            <p><strong>Quantity:</strong> ${order.quantity}</p>
                            <p><strong>Amount:</strong> ₹${order.amount.toLocaleString()}</p>
                            <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
                            <p><strong>Date:</strong> ${order.date}</p>
                        </div>
                        
                        ${order.notes ? `
                        <div class="detail-section">
                            <h4>Notes</h4>
                            <p>${order.notes}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${order.source === 'admin' ? '' : `
                    <div class="order-actions">
                        <select id="order-status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="screenshot" ${order.status === 'screenshot' ? 'selected' : ''}>Screenshot Received</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('order-details-view-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('order-details-view-modal').style.display = 'block';
}

function closeOrderDetailsView() {
    const modal = document.getElementById('order-details-view-modal');
    if (modal) modal.remove();
}

function viewScreenshot(orderId) {
    console.log('viewScreenshot called for order:', orderId);
    
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const order = customerOrders.find(o => o.orderId === orderId);
    
    console.log('Found order:', order);
    
    if (!order) {
        console.error('Order not found:', orderId);
        showNotification('Order not found', 'error');
        return;
    }
    
    // Check multiple possible screenshot locations
    let screenshotData = null;
    if (order.paymentScreenshot?.dataUrl) {
        screenshotData = order.paymentScreenshot.dataUrl;
    } else if (order.paymentScreenshot) {
        screenshotData = order.paymentScreenshot;
    } else if (order.screenshot?.dataUrl) {
        screenshotData = order.screenshot.dataUrl;
    } else if (order.screenshot) {
        screenshotData = order.screenshot;
    }
    
    console.log('Screenshot data found:', !!screenshotData);
    
    if (!screenshotData) {
        console.error('Screenshot not found for order:', orderId);
        showNotification('Payment screenshot not found for this order', 'error');
        return;
    }
    
    console.log('Creating screenshot modal');
    
    const modalHTML = `
        <div id="screenshot-view-modal" class="modal">
            <div class="modal-content screenshot-modal">
                <div class="modal-header">
                    <h3>Payment Screenshot - ${orderId}</h3>
                    <span class="close" onclick="closeScreenshotView()">&times;</span>
                </div>
                <div class="screenshot-view">
                    <img src="${screenshotData}" alt="Payment Screenshot" class="full-screenshot" onclick="viewFullscreenScreenshot('${screenshotData}')">
                    <div class="screenshot-info">
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Customer:</strong> ${order.customerDetails?.customerName || order.customerDetails?.name || 'Unknown'}</p>
                        <p><strong>Amount:</strong> ₹${(order.totalAmount || order.customerDetails?.total || 0).toLocaleString()}</p>
                        <p><strong>Product:</strong> ${order.product?.name || 'Unknown Product'}</p>
                        <p><em>Click image to view full screen</em></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('screenshot-view-modal');
    if (existingModal) existingModal.remove();
    
    console.log('Adding modal to body');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    console.log('Showing modal');
    document.getElementById('screenshot-view-modal').style.display = 'block';
}

function closeScreenshotView() {
    console.log('closeScreenshotView called');
    const modal = document.getElementById('screenshot-view-modal');
    if (modal) {
        console.log('Removing screenshot modal');
        modal.remove();
    }
}

function viewFullscreenScreenshot(imageSrc) {
    console.log('viewFullscreenScreenshot called');
    
    const fullscreenHTML = `
        <div id="screenshot-fullscreen" class="screenshot-fullscreen" onclick="closeFullscreenScreenshot()">
            <img src="${imageSrc}" alt="Payment Screenshot Fullscreen">
            <div style="position: absolute; top: 20px; right: 20px; color: white; font-size: 1.2rem; background: rgba(0,0,0,0.5); padding: 10px 15px; border-radius: 5px;">
                Click anywhere or press ESC to close
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', fullscreenHTML);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add keyboard listener for ESC key
    document.addEventListener('keydown', handleFullscreenKeydown);
}

function handleFullscreenKeydown(event) {
    if (event.key === 'Escape') {
        closeFullscreenScreenshot();
    }
}

function closeFullscreenScreenshot() {
    console.log('closeFullscreenScreenshot called');
    const fullscreen = document.getElementById('screenshot-fullscreen');
    if (fullscreen) {
        fullscreen.remove();
        document.body.style.overflow = 'auto';
        
        // Remove keyboard listener
        document.removeEventListener('keydown', handleFullscreenKeydown);
    }
}

// Make screenshot functions globally available
window.viewScreenshot = viewScreenshot;
window.closeScreenshotView = closeScreenshotView;
window.viewFullscreenScreenshot = viewFullscreenScreenshot;
window.closeFullscreenScreenshot = closeFullscreenScreenshot;

function updateOrderStatus(orderId, newStatus) {
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const orderIndex = customerOrders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex !== -1) {
        // Update the order status
        customerOrders[orderIndex].status = newStatus;
        
        // Add timestamp for status update
        customerOrders[orderIndex].statusUpdatedAt = new Date().toISOString();
        
        // Add status history for tracking
        if (!customerOrders[orderIndex].statusHistory) {
            customerOrders[orderIndex].statusHistory = [];
        }
        
        customerOrders[orderIndex].statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            updatedBy: 'owner'
        });
        
        // Save to localStorage
        localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
        
        // Try to update in database as well
        updateOrderStatusInDatabase(orderId, newStatus);
        
        // Trigger real-time update notification
        triggerRealTimeUpdate(orderId, newStatus);
        
        showNotification(`Order status updated to ${newStatus}`, 'success');
        loadOrders(); // Refresh the orders list
        
        // If tracking modal is open, refresh it
        const trackingModal = document.getElementById('order-tracking-modal');
        if (trackingModal) {
            // Close and reopen the tracking modal with updated status
            closeOrderTrackingModal();
            setTimeout(() => {
                trackOrder(orderId, 'customer');
            }, 100);
        }
        
        console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    } else {
        showNotification('Order not found', 'error');
    }
}

// Update order status in database
async function updateOrderStatusInDatabase(orderId, newStatus) {
    try {
        if (window.apiService) {
            const result = await window.apiService.updateOrderStatus(orderId, newStatus);
            if (result.success) {
                console.log('✅ Order status updated in database');
            } else {
                console.log('⚠️ Database update failed:', result.message);
            }
        }
    } catch (error) {
        console.log('⚠️ Database update error:', error.message);
    }
}

// Trigger real-time update for tracking page
function triggerRealTimeUpdate(orderId, newStatus) {
    console.log('🔄 Triggering real-time update for order:', orderId, 'status:', newStatus);
    
    // Create a real-time update event
    const updateEvent = {
        orderId: orderId,
        newStatus: newStatus,
        timestamp: new Date().toISOString(),
        type: 'status_update',
        source: 'owner_portal'
    };
    
    // Store in a special key for real-time updates
    const realtimeUpdates = JSON.parse(localStorage.getItem('realtimeOrderUpdates') || '[]');
    realtimeUpdates.push(updateEvent);
    
    // Keep only last 50 updates to prevent storage bloat
    if (realtimeUpdates.length > 50) {
        realtimeUpdates.splice(0, realtimeUpdates.length - 50);
    }
    
    localStorage.setItem('realtimeOrderUpdates', JSON.stringify(realtimeUpdates));
    
    // Create a cross-tab sync event
    const syncEvent = {
        type: 'ORDER_STATUS_UPDATE',
        orderId: orderId,
        newStatus: newStatus,
        timestamp: new Date().toISOString(),
        source: 'owner_portal'
    };
    
    // Store sync event for cross-tab communication
    localStorage.setItem('orderStatusSync', JSON.stringify(syncEvent));
    
    // Remove sync event after a short delay to trigger storage event
    setTimeout(() => {
        localStorage.removeItem('orderStatusSync');
    }, 100);
    
    // Trigger custom event for any listening pages
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
            detail: updateEvent
        }));
    }
    
    console.log('🔄 Real-time update triggered for order:', orderId);
}

// Helper function to convert file to base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// Database connection checker
async function checkDatabaseConnection() {
    try {
        showNotification('Checking database connection...', 'info');
        
        if (!window.apiService) {
            showNotification('❌ API Service not initialized', 'error');
            return;
        }
        
        const health = await window.apiService.healthCheck();
        
        if (health.success) {
            showNotification('✅ Database connected successfully!', 'success');
            console.log('Database status:', health);
        } else {
            showNotification('❌ Database connection failed: ' + (health.message || 'Unknown error'), 'error');
            console.log('Database error:', health);
        }
    } catch (error) {
        showNotification('❌ Cannot reach database server', 'error');
        console.error('Database connection error:', error);
    }
}

// Function to remove duplicate products
async function removeDuplicateProducts() {
    try {
        showNotification('Checking for duplicate products...', 'info');
        
        if (!window.apiService) {
            showNotification('❌ API Service not available', 'error');
            return;
        }
        
        const result = await window.apiService.getProducts();
        if (result.success && result.data) {
            const allProducts = result.data;
            const uniqueProducts = [];
            const seenNames = new Set();
            
            // Remove duplicates based on product name
            for (const product of allProducts) {
                if (!seenNames.has(product.name)) {
                    seenNames.add(product.name);
                    uniqueProducts.push(product);
                } else {
                    console.log('Found duplicate product:', product.name);
                }
            }
            
            if (allProducts.length > uniqueProducts.length) {
                const duplicatesCount = allProducts.length - uniqueProducts.length;
                showNotification(`Found ${duplicatesCount} duplicate products. Refreshing display...`, 'warning');
                
                // Refresh the products display
                await loadProducts();
            } else {
                showNotification('✅ No duplicate products found!', 'success');
            }
        }
    } catch (error) {
        showNotification('Error checking duplicates: ' + error.message, 'error');
    }
}

// Make all functions globally available at the end of the file
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateStock = updateStock;
window.confirmDeleteProduct = confirmDeleteProduct;
window.toggleStockInputs = toggleStockInputs;
window.updateStockPreview = updateStockPreview;
window.handleEditProduct = handleEditProduct;
window.handleStockUpdate = handleStockUpdate;
window.showAddProductModal = showAddProductModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.loadProducts = loadProducts;
window.handleAddProduct = handleAddProduct;
window.syncProductsToMainSite = syncProductsToMainSite;
window.checkDatabaseConnection = checkDatabaseConnection;
window.removeDuplicateProducts = removeDuplicateProducts;

// Initialize portal when DOM is ready
if (document.readyState === 'loading') {
    // DOM is still loading, wait for it
    document.addEventListener('DOMContentLoaded', initializePortal);
} else {
    // DOM is already loaded, initialize immediately
    initializePortal();
}

function filterOrders() {
    const filter = document.getElementById('order-filter').value;
    const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.status === filter);
    
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.date}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.quantity}</td>
            <td>₹${order.amount.toLocaleString()}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>
                <button class="btn-small" onclick="viewOrder('${order.id}')">View</button>
                <button class="btn-small" onclick="editOrder('${order.id}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

function handleAddOrder(e) {
    e.preventDefault();
    
    const newOrder = {
        id: 'ORD-' + String(orders.length + 1).padStart(3, '0'),
        date: new Date().toISOString().split('T')[0],
        customer: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        product: document.getElementById('order-product').options[document.getElementById('order-product').selectedIndex].text,
        quantity: parseInt(document.getElementById('order-quantity').value),
        unitPrice: parseFloat(document.getElementById('unit-price').value),
        amount: parseFloat(document.getElementById('total-amount').value),
        status: 'pending',
        notes: document.getElementById('order-notes').value
    };
    
    orders.unshift(newOrder);
    closeModal('add-order-modal');
    loadOrders();
    showNotification('Order added successfully!', 'success');
    
    // Reset form
    document.getElementById('add-order-form').reset();
}

// Product Management Functions
// Enhanced loadProducts function with MongoDB integration
async function loadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    try {
        // Show loading state
        grid.innerHTML = '<div style="text-align: center; padding: 40px;">Loading products...</div>';
        
        // Try to load from MongoDB first
        if (window.apiService) {
            try {
                const result = await window.apiService.getProducts();
                if (result.success && result.data) {
                    // Clear and update local products array with database data
                    products.length = 0;
                    products.push(...result.data);
                    console.log('✅ Products loaded from MongoDB:', products.length);
                } else {
                    console.log('⚠️ MongoDB load failed, using local products');
                }
            } catch (error) {
                console.log('⚠️ MongoDB unavailable, using local products:', error.message);
            }
        }
        
        // Render products
        if (products.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>No products found</h3>
                    <p>Add your first product to get started!</p>
                    <button class="btn btn-primary" onclick="showAddProductModal()">Add Product</button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-management-card">
                <div class="product-card-header">
                    <div class="product-card-title">${product.name}</div>
                    <div class="product-card-category">${product.category}</div>
                </div>
                <div class="product-card-body">
                    <div class="product-stats">
                        <div class="product-stat">
                            <div class="product-stat-label">Price</div>
                            <div class="product-stat-value">₹${product.price || 0}</div>
                        </div>
                        <div class="product-stat">
                            <div class="product-stat-label">Stock</div>
                            <div class="product-stat-value ${(product.stock || 0) <= (product.minStock || 0) ? 'text-danger' : ''}">${product.stock || 0}</div>
                        </div>
                        <div class="product-stat">
                            <div class="product-stat-label">Profit</div>
                            <div class="product-stat-value">₹${(product.price || 0) - (product.cost || 0)}</div>
                        </div>
                        <div class="product-stat">
                            <div class="product-stat-label">Margin</div>
                            <div class="product-stat-value">${product.price ? Math.round(((product.price - (product.cost || 0)) / product.price) * 100) : 0}%</div>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn-small" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="btn-small" onclick="updateStock('${product.id}')">Stock</button>
                        <button class="btn-small btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <h3>Error loading products</h3>
                <p>${error.message}</p>
                <button class="btn btn-secondary" onclick="loadProducts()">Retry</button>
            </div>
        `;
    }
}

// Enhanced handleAddProduct function with MongoDB integration
async function handleAddProduct(e) {
    e.preventDefault();
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding Product...';
        submitBtn.disabled = true;
        
        // Get image source (URL or file) with better validation and category-based defaults
        const imageUrl = document.getElementById('product-image-url').value.trim();
        const imageFile = document.getElementById('product-image-file').files[0];
        const category = document.getElementById('product-category').value;
        
        // Category-based default images
        const defaultImages = {
            'cocopeat': 'https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190898/photo_2025-12-31_22-18-07_c2hs4m.jpg',
            'bamboo': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbYHHF-lKgdGS9ftR4AwALD27xwGSO9hsldw&s',
            'eco-care': 'https://cdn.moglix.com/p/B5wXshH1wq7TS-xxlarge.jpg'
        };
        
        let productImage = defaultImages[category] || 'https://via.placeholder.com/300x200?text=No+Image';
        
        if (imageUrl) {
            // Validate URL format
            try {
                new URL(imageUrl);
                productImage = imageUrl;
            } catch (e) {
                showNotification('Invalid image URL format, using default image', 'warning');
                productImage = defaultImages[category] || 'https://via.placeholder.com/300x200?text=Invalid+URL';
            }
        } else if (imageFile) {
            // Validate file type
            if (!imageFile.type.startsWith('image/')) {
                showNotification('Please select a valid image file', 'error');
                throw new Error('Invalid file type');
            }
            
            // Validate file size (max 5MB)
            if (imageFile.size > 5 * 1024 * 1024) {
                showNotification('Image file too large. Please select a file under 5MB', 'error');
                throw new Error('File too large');
            }
            
            // Convert file to base64 for storage
            productImage = await convertFileToBase64(imageFile);
        }
        
        const newProduct = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            cost: parseFloat(document.getElementById('product-cost').value),
            stock: parseInt(document.getElementById('initial-stock').value),
            minStock: parseInt(document.getElementById('min-stock').value),
            image: productImage,
            sizes: ["Standard"], // Default size, can be enhanced later
            isActive: true
        };
        
        console.log('Creating new product:', newProduct);
        
        // Try to save to MongoDB first
        let savedProduct = null;
        let databaseSuccess = false;
        
        if (window.apiService) {
            try {
                console.log('🔄 Attempting to save to MongoDB...');
                const result = await window.apiService.createProduct(newProduct);
                if (result.success) {
                    savedProduct = result.data;
                    databaseSuccess = !result.fallback;
                    console.log('✅ Product saved to MongoDB:', savedProduct);
                    
                    if (result.fallback) {
                        showNotification('Product saved locally (database unavailable)', 'warning');
                    } else {
                        showNotification('Product added successfully to database!', 'success');
                    }
                } else {
                    console.log('⚠️ MongoDB save failed:', result.message);
                    showNotification('Database save failed: ' + result.message, 'error');
                }
            } catch (error) {
                console.log('⚠️ MongoDB error:', error.message);
                showNotification('Database error: ' + error.message, 'error');
            }
        } else {
            console.log('⚠️ API Service not available');
            showNotification('API Service not available', 'warning');
        }
        
        // ONLY add to local products array if database save failed
        if (!savedProduct || !databaseSuccess) {
            console.log('🔄 Using localStorage fallback...');
            // Generate unique ID for local storage
            const newId = Math.max(...products.map(p => parseInt(p.id) || 0), 0) + 1;
            savedProduct = { ...newProduct, id: newId };
            
            // Add to local array only when database is not available
            products.push(savedProduct);
            
            // Save to localStorage as fallback
            localStorage.setItem('allProducts', JSON.stringify(products));
        }
        
        // If database succeeded, refresh products from database to avoid duplicates
        if (databaseSuccess) {
            console.log('✅ Database save successful, refreshing from database...');
            // Don't add to local array - let loadProducts() fetch fresh data from database
        }
        
        // Force sync with main site immediately after adding product
        await syncProductsToMainSite();
        
        // Trigger real-time update for main website
        try {
            // Use localStorage event to notify main website of product changes
            const updateEvent = {
                type: 'productUpdate',
                action: 'productAdded',
                productId: savedProduct.id,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('productUpdateEvent', JSON.stringify(updateEvent));
            
            // Also dispatch a custom event for immediate updates
            window.dispatchEvent(new CustomEvent('productUpdated', {
                detail: updateEvent
            }));
            
            console.log('✅ Real-time update triggered for main website');
        } catch (error) {
            console.log('⚠️ Failed to trigger real-time update:', error.message);
        }
        
        // Also trigger a refresh of the main website's product cache
        try {
            // Force the main website to reload products from database
            if (window.apiService) {
                const result = await window.apiService.getProducts();
                if (result.success && result.data) {
                    // Update localStorage with fresh database data for main website
                    const websiteProducts = result.data.map(product => ({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        image: product.image,
                        description: product.description,
                        sizes: product.sizes || ["Standard"],
                        price: product.price,
                        cost: product.cost,
                        stock: product.stock
                    }));
                    localStorage.setItem('allProducts', JSON.stringify(websiteProducts));
                    console.log('✅ Main website cache updated with new product');
                }
            }
        } catch (error) {
            console.log('⚠️ Failed to update main website cache:', error.message);
        }
        
        console.log('✅ Product creation completed:', savedProduct);
        
        // Show final success message
        if (databaseSuccess) {
            showNotification('✅ Product successfully added to database!', 'success');
        } else {
            showNotification('✅ Product added successfully! (Saved locally - will sync when database is available)', 'success');
        }
        
        // Close modal and refresh
        closeModal('add-product-modal');
        await loadProducts();
        
        // Reset form
        document.getElementById('add-product-form').reset();
        document.getElementById('product-image-preview').style.display = 'none';
        
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Error adding product: ' + error.message, 'error');
        
        // Restore button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add Product';
        submitBtn.disabled = false;
    }
}

// Enhanced syncProductsToMainSite function
async function syncProductsToMainSite() {
    try {
        let allProducts = [];
        
        // Always try to get latest products from MongoDB first
        if (window.apiService) {
            try {
                const result = await window.apiService.getProducts();
                if (result.success && result.data) {
                    allProducts = result.data;
                    console.log('✅ Synced products from MongoDB:', allProducts.length);
                    
                    // Update local products array to match database (avoid duplicates)
                    products.length = 0; // Clear local array
                    products.push(...allProducts); // Update with fresh database data
                } else {
                    console.log('⚠️ MongoDB sync failed, using local products');
                    allProducts = [...products]; // Use copy of local products
                }
            } catch (error) {
                console.log('⚠️ MongoDB sync failed, using local products:', error.message);
                allProducts = [...products]; // Use copy of local products
            }
        } else {
            console.log('⚠️ API Service not available, using local products');
            allProducts = [...products]; // Use copy of local products
        }
        
        // Remove duplicates based on ID (just in case)
        const uniqueProducts = allProducts.filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
        );
        
        // Convert to main site format
        const mainSiteProducts = uniqueProducts.map(product => ({
            id: parseInt(product.id) || product.id,
            name: product.name,
            category: product.category,
            image: product.image,
            description: product.description,
            sizes: product.sizes || ["Standard"],
            price: product.price || 100,
            cost: product.cost || 50,
            stock: product.stock || 0
        }));
        
        // Save to localStorage for main site to pick up
        localStorage.setItem('allProducts', JSON.stringify(mainSiteProducts));
        console.log('✅ Products synced to main site:', mainSiteProducts.length, 'unique products');
        
        return mainSiteProducts;
    } catch (error) {
        console.error('❌ Error syncing products:', error);
        return products;
    }
}

// Sales Data Functions
function loadSalesData() {
    const tbody = document.getElementById('monthly-breakdown-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = monthlyData.map(month => `
        <tr>
            <td>${month.month}</td>
            <td>₹${month.sales.toLocaleString()}</td>
            <td>₹${month.costs.toLocaleString()}</td>
            <td>₹${month.profit.toLocaleString()}</td>
            <td>${Math.round((month.profit / month.sales) * 100)}%</td>
            <td>${month.orders}</td>
        </tr>
    `).join('');
}

// Modal Functions
function showAddOrderModal() {
    document.getElementById('add-order-modal').style.display = 'block';
}

function showAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Utility Functions
function exportOrders() {
    showNotification('Exporting orders data...', 'info');
}

function exportProducts() {
    showNotification('Exporting products data...', 'info');
}

function exportSalesReport() {
    showNotification('Exporting sales report...', 'info');
}

function bulkUpdatePrices() {
    showNotification('Bulk price update feature coming soon!', 'info');
}

function viewOrder(orderId) {
    showNotification(`Viewing order ${orderId}`, 'info');
}

function editOrder(orderId) {
    showNotification(`Editing order ${orderId}`, 'info');
}

// Delete Order Function
async function deleteOrder(orderId, source) {
    console.log('Deleting order:', orderId, 'from source:', source);
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete order ${orderId}?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        if (source === 'admin') {
            // Delete from admin orders
            const orderIndex = orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                orders.splice(orderIndex, 1);
                showNotification(`Order ${orderId} deleted successfully!`, 'success');
            } else {
                showNotification('Order not found in admin orders', 'error');
                return;
            }
        } else {
            // Delete from customer orders (localStorage)
            const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
            const orderIndex = customerOrders.findIndex(o => o.orderId === orderId);
            
            if (orderIndex !== -1) {
                customerOrders.splice(orderIndex, 1);
                localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
                showNotification(`Order ${orderId} deleted successfully!`, 'success');
                
                // Try to delete from database as well
                if (window.apiService) {
                    try {
                        await window.apiService.deleteOrder(orderId);
                        console.log('✅ Order deleted from database');
                    } catch (error) {
                        console.log('⚠️ Could not delete from database:', error.message);
                    }
                }
            } else {
                showNotification('Order not found in customer orders', 'error');
                return;
            }
        }
        
        // Reload orders to refresh the display
        await loadOrders();
        
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Error deleting order: ' + error.message, 'error');
    }
}

// Make deleteOrder globally available
window.deleteOrder = deleteOrder;

// Enhanced editProduct function with full modal implementation
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Create edit product modal
    const modalHTML = `
        <div id="edit-product-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Product - ${product.name}</h3>
                    <span class="close" onclick="closeModal('edit-product-modal')">&times;</span>
                </div>
                <form id="edit-product-form" class="modal-form">
                    <input type="hidden" id="edit-product-id" value="${product.id}">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-product-name">Product Name</label>
                            <input type="text" id="edit-product-name" value="${product.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-product-category">Category</label>
                            <select id="edit-product-category" required>
                                <option value="cocopeat" ${product.category === 'cocopeat' ? 'selected' : ''}>Cocopeat</option>
                                <option value="bamboo" ${product.category === 'bamboo' ? 'selected' : ''}>Bamboo Products</option>
                                <option value="eco-care" ${product.category === 'eco-care' ? 'selected' : ''}>Eco-Care</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-product-description">Description</label>
                        <textarea id="edit-product-description" rows="3" required>${product.description}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-product-price">Price (₹)</label>
                            <input type="number" id="edit-product-price" step="0.01" value="${product.price}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-product-cost">Cost (₹)</label>
                            <input type="number" id="edit-product-cost" step="0.01" value="${product.cost}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-product-stock">Current Stock</label>
                            <input type="number" id="edit-product-stock" min="0" value="${product.stock}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-min-stock">Minimum Stock Alert</label>
                            <input type="number" id="edit-min-stock" min="0" value="${product.minStock}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-product-image">Product Image URL</label>
                        <input type="url" id="edit-product-image" value="${product.image}" placeholder="https://example.com/image.jpg">
                        <div class="image-preview" id="edit-image-preview" style="display: ${product.image ? 'block' : 'none'};">
                            <img id="edit-preview-img" src="${product.image}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 10px;">
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal('edit-product-modal')">Cancel</button>
                        <button type="submit" class="btn-primary">Update Product</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('edit-product-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('edit-product-modal').style.display = 'block';
    
    // Add form handler
    document.getElementById('edit-product-form').addEventListener('submit', handleEditProduct);
    
    // Add image preview handler
    document.getElementById('edit-product-image').addEventListener('input', function() {
        if (this.value) {
            const preview = document.getElementById('edit-image-preview');
            const previewImg = document.getElementById('edit-preview-img');
            previewImg.src = this.value;
            preview.style.display = 'block';
        }
    });
}

// Handle edit product form submission
async function handleEditProduct(e) {
    e.preventDefault();
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        
        const productId = document.getElementById('edit-product-id').value;
        const updatedProduct = {
            id: productId,
            name: document.getElementById('edit-product-name').value,
            category: document.getElementById('edit-product-category').value,
            description: document.getElementById('edit-product-description').value,
            price: parseFloat(document.getElementById('edit-product-price').value),
            cost: parseFloat(document.getElementById('edit-product-cost').value),
            stock: parseInt(document.getElementById('edit-product-stock').value),
            minStock: parseInt(document.getElementById('edit-min-stock').value),
            image: document.getElementById('edit-product-image').value || 'https://via.placeholder.com/300x200'
        };
        
        // Try to update in MongoDB first
        let updateSuccess = false;
        if (window.apiService) {
            try {
                const result = await window.apiService.updateProduct(productId, updatedProduct);
                if (result.success) {
                    updateSuccess = true;
                    console.log('✅ Product updated in MongoDB');
                    showNotification('Product updated successfully in database!', 'success');
                } else {
                    console.log('⚠️ MongoDB update failed:', result.message);
                    showNotification('Database update failed, updating locally', 'warning');
                }
            } catch (error) {
                console.log('⚠️ MongoDB error:', error.message);
                showNotification('Database unavailable, updating locally', 'warning');
            }
        }
        
        // Update local products array ONLY if database update failed
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1 && !updateSuccess) {
            products[productIndex] = { ...products[productIndex], ...updatedProduct };
        }
        
        // Sync with main site
        await syncProductsToMainSite();
        
        // Close modal and refresh
        closeModal('edit-product-modal');
        await loadProducts();
        
        if (!updateSuccess) {
            showNotification('Product updated locally!', 'success');
        }
        
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Error updating product: ' + error.message, 'error');
        
        // Restore button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Product';
        submitBtn.disabled = false;
    }
}

// Enhanced deleteProduct function with confirmation
async function deleteProduct(productId) {
    console.log('deleteProduct called with ID:', productId, 'Type:', typeof productId);
    
    // Convert productId to number for consistent comparison
    const numericId = parseInt(productId);
    const product = products.find(p => p.id == productId || p.id == numericId);
    
    console.log('Looking for product with ID:', productId, 'or', numericId);
    console.log('Available products:', products.map(p => ({ id: p.id, name: p.name, idType: typeof p.id })));
    
    if (!product) {
        console.error('Product not found. Available product IDs:', products.map(p => p.id));
        showNotification('Product not found. Please refresh the page and try again.', 'error');
        return;
    }
    
    console.log('Found product:', product.name);
    
    // Show confirmation modal
    const confirmHTML = `
        <div id="delete-confirm-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                    <span class="close" onclick="closeModal('delete-confirm-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="delete-confirmation">
                        <div class="warning-icon">⚠️</div>
                        <h4>Are you sure you want to delete this product?</h4>
                        <div class="product-info">
                            <p><strong>Product:</strong> ${product.name}</p>
                            <p><strong>Category:</strong> ${product.category}</p>
                            <p><strong>Current Stock:</strong> ${product.stock}</p>
                            <p><strong>Price:</strong> ₹${product.price}</p>
                        </div>
                        <p class="warning-text">This action cannot be undone. The product will be permanently removed from your inventory.</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal('delete-confirm-modal')">Cancel</button>
                    <button type="button" class="btn-danger" onclick="confirmDeleteProduct('${product.id}')">Delete Product</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('delete-confirm-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', confirmHTML);
    document.getElementById('delete-confirm-modal').style.display = 'block';
}

// Confirm and execute product deletion
async function confirmDeleteProduct(productId) {
    try {
        // Show loading state
        const deleteBtn = document.querySelector('#delete-confirm-modal .btn-danger');
        if (!deleteBtn) {
            console.error('Delete button not found in modal');
            showNotification('Error: Delete button not found', 'error');
            return;
        }
        
        const originalText = deleteBtn.textContent;
        deleteBtn.textContent = 'Deleting...';
        deleteBtn.disabled = true;
        
        console.log('🔄 Attempting to delete product with ID:', productId, 'Type:', typeof productId);
        
        // Convert to number for consistent handling
        const numericId = parseInt(productId);
        console.log('🔄 Numeric ID:', numericId);
        
        // Try to delete from MongoDB first
        let deleteSuccess = false;
        let errorMessage = '';
        
        if (window.apiService) {
            try {
                console.log('🔄 Calling API service deleteProduct...');
                const result = await window.apiService.deleteProduct(numericId);
                console.log('🔄 API delete result:', result);
                
                if (result.success && !result.fallback) {
                    deleteSuccess = true;
                    console.log('✅ Product deleted from MongoDB');
                } else {
                    console.log('⚠️ MongoDB delete failed:', result.message);
                    errorMessage = result.message || 'Database delete failed';
                }
            } catch (error) {
                console.log('⚠️ MongoDB error:', error.message);
                errorMessage = error.message;
            }
        } else {
            console.log('⚠️ API Service not available');
            errorMessage = 'API Service not available';
        }
        
        // Remove from local products array (always do this for UI consistency)
        const productIndex = products.findIndex(p => p.id == productId || p.id == numericId);
        console.log('🔄 Looking for product in local array, index found:', productIndex);
        
        if (productIndex !== -1) {
            const deletedProduct = products.splice(productIndex, 1)[0];
            console.log('✅ Product removed from local array:', deletedProduct.name);
        } else {
            console.log('⚠️ Product not found in local array with ID:', productId);
            console.log('Available products:', products.map(p => ({ id: p.id, name: p.name })));
        }
        
        // Sync with main site
        console.log('🔄 Syncing products to main site...');
        await syncProductsToMainSite();
        
        // Close modal and refresh
        closeModal('delete-confirm-modal');
        console.log('🔄 Reloading products...');
        await loadProducts();
        
        // Show appropriate success message
        if (deleteSuccess) {
            showNotification('✅ Product deleted successfully from database!', 'success');
        } else if (errorMessage) {
            showNotification(`⚠️ Product removed from display but database error: ${errorMessage}`, 'warning');
        } else {
            showNotification('✅ Product deleted successfully!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showNotification('Error deleting product: ' + error.message, 'error');
        
        // Restore button state
        const deleteBtn = document.querySelector('#delete-confirm-modal .btn-danger');
        if (deleteBtn) {
            deleteBtn.textContent = 'Delete Product';
            deleteBtn.disabled = false;
        }
    }
        
        // Restore button state
        const deleteBtn = document.querySelector('#delete-confirm-modal .btn-danger');
        if (deleteBtn) {
            deleteBtn.textContent = 'Delete Product';
            deleteBtn.disabled = false;
        }
    }

// Enhanced updateStock function with quick stock adjustment modal
function updateStock(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Create stock update modal
    const modalHTML = `
        <div id="stock-update-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Update Stock - ${product.name}</h3>
                    <span class="close" onclick="closeModal('stock-update-modal')">&times;</span>
                </div>
                <form id="stock-update-form" class="modal-form">
                    <input type="hidden" id="stock-product-id" value="${product.id}">
                    
                    <div class="stock-info">
                        <div class="current-stock">
                            <h4>Current Stock: <span class="${product.stock <= product.minStock ? 'text-danger' : ''}">${product.stock}</span></h4>
                            ${product.stock <= product.minStock ? '<p class="warning-text">⚠️ Stock is below minimum threshold!</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="stock-adjustment-type">Adjustment Type</label>
                        <select id="stock-adjustment-type" onchange="toggleStockInputs()" required>
                            <option value="">Select adjustment type</option>
                            <option value="set">Set New Stock Level</option>
                            <option value="add">Add Stock (Restock)</option>
                            <option value="remove">Remove Stock (Damage/Loss)</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="stock-input-group" style="display: none;">
                        <label for="stock-amount" id="stock-amount-label">Amount</label>
                        <input type="number" id="stock-amount" min="0" required>
                        <div id="stock-preview" class="stock-preview"></div>
                    </div>
                    
                    <div class="form-group" id="stock-reason-group" style="display: none;">
                        <label for="stock-reason">Reason (Optional)</label>
                        <input type="text" id="stock-reason" placeholder="e.g., New shipment, Damaged goods, etc.">
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal('stock-update-modal')">Cancel</button>
                        <button type="submit" class="btn-primary">Update Stock</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('stock-update-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('stock-update-modal').style.display = 'block';
    
    // Add form handler
    document.getElementById('stock-update-form').addEventListener('submit', handleStockUpdate);
    
    // Add input handler for preview
    document.getElementById('stock-amount').addEventListener('input', updateStockPreview);
}

// Toggle stock input visibility based on adjustment type
function toggleStockInputs() {
    const adjustmentType = document.getElementById('stock-adjustment-type').value;
    const inputGroup = document.getElementById('stock-input-group');
    const reasonGroup = document.getElementById('stock-reason-group');
    const amountLabel = document.getElementById('stock-amount-label');
    const amountInput = document.getElementById('stock-amount');
    
    if (adjustmentType) {
        inputGroup.style.display = 'block';
        reasonGroup.style.display = 'block';
        
        switch (adjustmentType) {
            case 'set':
                amountLabel.textContent = 'New Stock Level';
                amountInput.placeholder = 'Enter new stock quantity';
                break;
            case 'add':
                amountLabel.textContent = 'Add Quantity';
                amountInput.placeholder = 'Enter quantity to add';
                break;
            case 'remove':
                amountLabel.textContent = 'Remove Quantity';
                amountInput.placeholder = 'Enter quantity to remove';
                break;
        }
        
        updateStockPreview();
    } else {
        inputGroup.style.display = 'none';
        reasonGroup.style.display = 'none';
    }
}

// Update stock preview
function updateStockPreview() {
    const productId = document.getElementById('stock-product-id').value;
    const product = products.find(p => p.id === productId);
    const adjustmentType = document.getElementById('stock-adjustment-type').value;
    const amount = parseInt(document.getElementById('stock-amount').value) || 0;
    const preview = document.getElementById('stock-preview');
    
    if (!product || !adjustmentType || amount === 0) {
        preview.innerHTML = '';
        return;
    }
    
    let newStock = product.stock;
    
    switch (adjustmentType) {
        case 'set':
            newStock = amount;
            break;
        case 'add':
            newStock = product.stock + amount;
            break;
        case 'remove':
            newStock = Math.max(0, product.stock - amount);
            break;
    }
    
    const isLowStock = newStock <= product.minStock;
    const stockChange = newStock - product.stock;
    
    preview.innerHTML = `
        <div class="stock-preview-content">
            <p><strong>Current:</strong> ${product.stock} → <strong>New:</strong> <span class="${isLowStock ? 'text-danger' : ''}">${newStock}</span></p>
            <p><strong>Change:</strong> ${stockChange > 0 ? '+' : ''}${stockChange}</p>
            ${isLowStock ? '<p class="warning-text">⚠️ New stock will be below minimum threshold!</p>' : ''}
        </div>
    `;
}

// Handle stock update form submission
async function handleStockUpdate(e) {
    e.preventDefault();
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        
        const productId = document.getElementById('stock-product-id').value;
        const adjustmentType = document.getElementById('stock-adjustment-type').value;
        const amount = parseInt(document.getElementById('stock-amount').value);
        const reason = document.getElementById('stock-reason').value;
        
        const product = products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Product not found');
        }
        
        let newStock = product.stock;
        
        switch (adjustmentType) {
            case 'set':
                newStock = amount;
                break;
            case 'add':
                newStock = product.stock + amount;
                break;
            case 'remove':
                newStock = Math.max(0, product.stock - amount);
                break;
        }
        
        // Try to update in MongoDB first
        let updateSuccess = false;
        if (window.apiService) {
            try {
                const result = await window.apiService.updateProduct(productId, { stock: newStock });
                if (result.success) {
                    updateSuccess = true;
                    console.log('✅ Stock updated in MongoDB');
                    showNotification('Stock updated successfully in database!', 'success');
                } else {
                    console.log('⚠️ MongoDB update failed:', result.message);
                    showNotification('Database update failed, updating locally', 'warning');
                }
            } catch (error) {
                console.log('⚠️ MongoDB error:', error.message);
                showNotification('Database unavailable, updating locally', 'warning');
            }
        }
        
        // Update local products array
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            products[productIndex].stock = newStock;
        }
        
        // Sync with main site
        await syncProductsToMainSite();
        
        // Close modal and refresh
        closeModal('stock-update-modal');
        await loadProducts();
        
        if (!updateSuccess) {
            showNotification('Stock updated locally!', 'success');
        }
        
        // Log the stock change for audit purposes
        console.log(`Stock Update: ${product.name} - ${adjustmentType} ${amount} (${product.stock} → ${newStock})${reason ? ` - Reason: ${reason}` : ''}`);
        
    } catch (error) {
        console.error('Error updating stock:', error);
        showNotification('Error updating stock: ' + error.message, 'error');
        
        // Restore button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Stock';
        submitBtn.disabled = false;
    }
}

function showImagePreview(imageSrc) {
    const preview = document.getElementById('product-image-preview');
    const previewImg = document.getElementById('preview-img');
    
    if (preview && previewImg) {
        previewImg.src = imageSrc;
        preview.style.display = 'block';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '5px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Security measures
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        showNotification('Developer tools are disabled for security.', 'warning');
    }
});
// Real-time Statistics Calculation
function updateRealTimeStats(allOrders) {
    console.log('Updating real-time statistics...');
    
    // Calculate current month statistics
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentYear = new Date().getFullYear();
    
    // Filter orders for current month
    const thisMonthOrders = allOrders.filter(order => {
        const orderMonth = order.orderMonth || order.date?.slice(0, 7);
        return orderMonth === currentMonth;
    });
    
    // Calculate totals
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const pendingOrders = allOrders.filter(order => 
        order.status === 'pending' || order.status === 'screenshot'
    ).length;
    
    // Calculate this month's performance
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const thisMonthOrderCount = thisMonthOrders.length;
    
    // Calculate profit (assuming 40% profit margin)
    const profitMargin = 0.40;
    const thisMonthProfit = thisMonthRevenue * profitMargin;
    const totalProfit = totalRevenue * profitMargin;
    
    // Update Business Overview stats
    updateBusinessOverview({
        totalOrders,
        totalRevenue,
        pendingOrders,
        thisMonthRevenue,
        thisMonthProfit,
        thisMonthOrderCount
    });
    
    // Update Monthly Sales data
    updateMonthlySalesData(allOrders, currentYear);
    
    console.log('Statistics updated:', {
        totalOrders,
        totalRevenue,
        thisMonthRevenue,
        thisMonthProfit,
        pendingOrders
    });
}

function updateBusinessOverview(stats) {
    // Update the stat cards in Business Overview
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = stats.totalOrders;
        statNumbers[1].textContent = '₹' + stats.totalRevenue.toLocaleString();
        statNumbers[2].textContent = products.length; // Keep products count from products array
        statNumbers[3].textContent = stats.pendingOrders;
    }
    
    // Update sales overview cards if on sales section
    const salesCards = document.querySelectorAll('.sales-amount');
    if (salesCards.length >= 4) {
        salesCards[0].textContent = '₹' + stats.thisMonthRevenue.toLocaleString();
        salesCards[1].textContent = '₹' + stats.thisMonthProfit.toLocaleString();
        salesCards[2].textContent = Math.round((stats.thisMonthProfit / stats.thisMonthRevenue) * 100) + '%';
        salesCards[3].textContent = '₹' + stats.totalRevenue.toLocaleString();
    }
}

function updateMonthlySalesData(allOrders, year) {
    // Group orders by month
    const monthlyStats = {};
    
    // Initialize all months
    for (let month = 1; month <= 12; month++) {
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        monthlyStats[monthKey] = {
            month: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
            sales: 0,
            orders: 0,
            costs: 0,
            profit: 0
        };
    }
    
    // Calculate actual data from orders
    allOrders.forEach(order => {
        const orderMonth = order.orderMonth || order.date?.slice(0, 7);
        if (orderMonth && monthlyStats[orderMonth]) {
            const orderAmount = order.amount || 0;
            const orderCost = orderAmount * 0.6; // Assuming 60% cost, 40% profit
            const orderProfit = orderAmount * 0.4;
            
            monthlyStats[orderMonth].sales += orderAmount;
            monthlyStats[orderMonth].orders += 1;
            monthlyStats[orderMonth].costs += orderCost;
            monthlyStats[orderMonth].profit += orderProfit;
        }
    });
    
    // Update the monthly breakdown table
    const tbody = document.getElementById('monthly-breakdown-tbody');
    if (tbody) {
        tbody.innerHTML = Object.values(monthlyStats).map(month => `
            <tr>
                <td>${month.month}</td>
                <td>₹${Math.round(month.sales).toLocaleString()}</td>
                <td>₹${Math.round(month.costs).toLocaleString()}</td>
                <td>₹${Math.round(month.profit).toLocaleString()}</td>
                <td>${month.sales > 0 ? Math.round((month.profit / month.sales) * 100) : 0}%</td>
                <td>${month.orders}</td>
            </tr>
        `).join('');
    }
    
    // Update global monthlyData for chart
    monthlyData = Object.values(monthlyStats).map(month => ({
        month: month.month,
        sales: Math.round(month.sales),
        costs: Math.round(month.costs),
        profit: Math.round(month.profit),
        orders: month.orders
    }));
}

// Update the order details modal to show size/variant
function showOrderDetailsModal(order) {
    const modalHTML = `
        <div id="order-details-view-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Order Details - ${order.id}</h3>
                    <span class="close" onclick="closeOrderDetailsView()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-details-grid">
                        <div class="detail-section">
                            <h4>Customer Information</h4>
                            <p><strong>Name:</strong> ${order.customer}</p>
                            <p><strong>Email:</strong> ${order.email}</p>
                            ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
                            ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
                        </div>
                        
                        <div class="detail-section">
                            <h4>Order Information</h4>
                            <p><strong>Product:</strong> ${order.product}</p>
                            ${order.productSize && order.productSize !== 'Not specified' ? 
                                `<p><strong>Size/Variant:</strong> ${order.productSize}</p>` : ''
                            }
                            <p><strong>Quantity:</strong> ${order.quantity}</p>
                            <p><strong>Unit Price:</strong> ₹${Math.round(order.unitPrice || 0).toLocaleString()}</p>
                            <p><strong>Total Amount:</strong> ₹${order.amount.toLocaleString()}</p>
                            <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
                            <p><strong>Date:</strong> ${order.date}</p>
                        </div>
                        
                        ${order.notes ? `
                        <div class="detail-section">
                            <h4>Notes</h4>
                            <p>${order.notes}</p>
                        </div>
                        ` : ''}
                        
                        ${order.hasScreenshot ? `
                        <div class="detail-section">
                            <h4>Payment Screenshot</h4>
                            <button class="btn-primary" onclick="viewScreenshot('${order.id}')">View Payment Screenshot</button>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${order.source === 'admin' ? '' : `
                    <div class="order-actions">
                        <label for="order-status-select"><strong>Update Status:</strong></label>
                        <select id="order-status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="screenshot" ${order.status === 'screenshot' ? 'selected' : ''}>Screenshot Received</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('order-details-view-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('order-details-view-modal').style.display = 'block';
}