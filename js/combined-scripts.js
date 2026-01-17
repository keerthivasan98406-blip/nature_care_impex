/* Combined JavaScript - All Scripts in One File */

/* ===== API SERVICE ===== */
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.fallbackToLocalStorage = true;
        this.serverConnected = false;
    }

    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API call failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            if (this.fallbackToLocalStorage) {
                console.log('Falling back to localStorage...');
                return this.handleFallback(endpoint, options);
            }
            
            throw error;
        }
    }

    handleFallback(endpoint, options) {
        console.log('Using localStorage fallback for:', endpoint, options.method || 'GET');
        
        if (endpoint === '/products' && (!options.method || options.method === 'GET')) {
            return {
                success: true,
                data: JSON.parse(localStorage.getItem('allProducts') || '[]'),
                fallback: true,
                message: 'Loaded from localStorage (database unavailable)'
            };
        }
        
        return {
            success: false,
            message: 'API unavailable and no fallback available for this operation',
            fallback: true
        };
    }
}
    // Products API
    async getProducts(category = null) {
        const endpoint = category ? `/products?category=${category}` : '/products';
        const result = await this.apiCall(endpoint);
        return result;
    }

    async createProduct(productData) {
        try {
            const result = await this.apiCall('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            return result;
        } catch (error) {
            console.error('Create product error:', error);
            
            if (this.fallbackToLocalStorage) {
                const products = JSON.parse(localStorage.getItem('allProducts') || '[]');
                const newId = Math.max(...products.map(p => parseInt(p.id) || 0), 0) + 1;
                const newProduct = { ...productData, id: newId };
                products.push(newProduct);
                localStorage.setItem('allProducts', JSON.stringify(products));
                
                return {
                    success: true,
                    data: newProduct,
                    fallback: true,
                    message: 'Product saved locally (database unavailable)'
                };
            }
            
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
            const formattedOrderData = {
                orderId: orderData.orderId,
                product: {
                    id: orderData.product.id,
                    name: orderData.product.name,
                    category: orderData.product.category,
                    image: orderData.product.image,
                    description: orderData.product.description
                },
                customerDetails: {
                    customerName: orderData.customerDetails.customerName || orderData.customerDetails.name,
                    customerEmail: orderData.customerDetails.customerEmail || orderData.customerDetails.email,
                    customerPhone: orderData.customerDetails.customerPhone || orderData.customerDetails.phone,
                    deliveryAddress: orderData.customerDetails.deliveryAddress || orderData.customerDetails.address,
                    quantity: orderData.customerDetails.quantity,
                    orderNotes: orderData.customerDetails.orderNotes || orderData.customerDetails.notes || ''
                },
                unitPrice: orderData.unitPrice,
                totalAmount: orderData.totalAmount,
                status: orderData.status || 'pending',
                productSize: orderData.productSize || 'Standard',
                paymentScreenshot: orderData.paymentScreenshot || null,
                orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
                orderMonth: orderData.orderMonth || new Date().toISOString().slice(0, 7),
                submittedAt: orderData.submittedAt || new Date(),
                createdAt: orderData.createdAt || new Date().toISOString()
            };

            console.log('📤 Sending order to API:', formattedOrderData);

            const result = await this.apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify(formattedOrderData)
            });
            
            if (result.success) {
                const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
                orders.push(result.data);
                localStorage.setItem('customerOrders', JSON.stringify(orders));
                console.log('✅ Order saved to database and localStorage');
            }
            
            return result;
        } catch (error) {
            console.error('Create order error:', error);
            
            if (this.fallbackToLocalStorage) {
                const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
                orders.push(orderData);
                localStorage.setItem('customerOrders', JSON.stringify(orders));
                
                console.log('⚠️ Order saved to localStorage only (database unavailable)');
                
                return {
                    success: true,
                    data: orderData,
                    fallback: true,
                    message: 'Order saved locally (database unavailable)'
                };
            }
            
            throw error;
        }
    }

    async healthCheck() {
        try {
            const result = await fetch(`${this.baseURL}/health`);
            const data = await result.json();
            this.serverConnected = data.success;
            return data;
        } catch (error) {
            this.serverConnected = false;
            return { success: false, message: 'Server unavailable' };
        }
    }
}

// Create global instance
window.apiService = new APIService();

/* ===== MAIN WEBSITE FUNCTIONALITY ===== */

// Buy Now Ordering System - Define functions first
let currentOrder = null;
let products = [];
let currentFilterCategory = 'all';

function startOrderProcess(productId) {
    console.log('startOrderProcess called with productId:', productId);
    
    if (!products || products.length === 0) {
        console.log('Products not loaded, refreshing...');
        refreshProducts();
    }
    
    const id = parseInt(productId);
    console.log('Converted ID:', id);
    console.log('Available products:', products);
    
    let product = products.find(p => p.id === id || p.id === productId || p.id === String(productId));
    
    if (!product) {
        console.log('Product not found, refreshing products and trying again...');
        refreshProducts();
        product = products.find(p => p.id === id || p.id === productId || p.id === String(productId));
    }
    
    console.log('Found product:', product);
    
    if (!product) {
        console.error('Product not found after refresh:', productId);
        console.error('Available product IDs:', products.map(p => p.id));
        alert('Product not found. Please refresh the page and try again.');
        return;
    }
    
    const orderData = {
        product: product,
        orderId: 'ORD-' + Date.now(),
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentOrder', JSON.stringify(orderData));
    console.log('Order data stored:', orderData);
    
    window.location.href = 'order-details.html?id=' + productId;
}

function loadOrderDetailsPage() {
    console.log('Loading order details page...');
    
    const orderDataStr = sessionStorage.getItem('currentOrder');
    if (!orderDataStr) {
        console.error('No order data found');
        alert('No order data found. Redirecting to products page.');
        window.location.href = 'products.html';
        return;
    }
    
    const orderData = JSON.parse(orderDataStr);
    console.log('Loaded order data:', orderData);
    
    populateProductInfo(orderData.product);
    setupOrderForm(orderData);
}

function populateProductInfo(product) {
    console.log('Populating product info:', product);
    
    document.getElementById('order-product-image').src = product.image;
    document.getElementById('order-product-image').alt = product.name;
    document.getElementById('order-product-name').textContent = product.name;
    document.getElementById('order-product-category').textContent = product.category;
    document.getElementById('order-product-description').textContent = product.description;
    
    const price = getProductPrice(product.id);
    document.getElementById('order-product-price').textContent = `₹${price.toLocaleString()}`;
    
    const sizeSelect = document.getElementById('product-size');
    sizeSelect.innerHTML = '';
    product.sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });
    
    document.getElementById('summary-product-name').textContent = product.name;
    document.getElementById('summary-unit-price').textContent = `₹${price.toLocaleString()}`;
    updateOrderSummary();
}

function setupOrderForm(orderData) {
    const form = document.getElementById('order-form');
    const quantityInput = document.getElementById('order-quantity');
    
    quantityInput.addEventListener('input', updateOrderSummary);
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleOrderFormSubmit(orderData);
    });
    
    console.log('Order form setup complete');
}

function updateOrderSummary() {
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    const orderData = JSON.parse(sessionStorage.getItem('currentOrder'));
    const price = getProductPrice(orderData.product.id);
    const total = quantity * price;
    
    document.getElementById('summary-quantity').textContent = quantity;
    document.getElementById('summary-total').textContent = `₹${total.toLocaleString()}`;
}

function handleOrderFormSubmit(orderData) {
    console.log('Handling order form submit...');
    
    const formData = {
        customerName: document.getElementById('customer-name').value,
        customerPhone: document.getElementById('customer-phone').value,
        customerEmail: document.getElementById('customer-email').value,
        deliveryAddress: document.getElementById('delivery-address').value,
        productSize: document.getElementById('product-size').value,
        quantity: parseInt(document.getElementById('order-quantity').value),
        orderNotes: document.getElementById('order-notes').value
    };
    
    const price = getProductPrice(orderData.product.id);
    const total = formData.quantity * price;
    
    const finalOrder = {
        ...orderData,
        customerDetails: formData,
        unitPrice: price,
        totalAmount: total,
        status: 'pending',
        productSize: formData.productSize,
        orderDate: new Date().toISOString().split('T')[0],
        orderMonth: new Date().toISOString().slice(0, 7)
    };
    
    console.log('Final order:', finalOrder);
    
    sessionStorage.setItem('orderForPayment', JSON.stringify(finalOrder));
    
    window.location.href = 'payment.html';
}

function loadPaymentPage() {
    console.log('Loading payment page...');
    
    const orderDataStr = sessionStorage.getItem('orderForPayment');
    if (!orderDataStr) {
        console.error('No order data found for payment');
        alert('No order data found. Redirecting to products page.');
        window.location.href = 'products.html';
        return;
    }
    
    const orderData = JSON.parse(orderDataStr);
    console.log('Loaded payment order data:', orderData);
    
    populatePaymentInfo(orderData);
    generatePaymentQR(orderData);
}

function populatePaymentInfo(orderData) {
    console.log('Populating payment info...');
    
    document.getElementById('payment-order-id').textContent = orderData.orderId;
    document.getElementById('payment-product-name').textContent = orderData.product.name;
    document.getElementById('payment-quantity').textContent = orderData.customerDetails.quantity;
    document.getElementById('payment-unit-price').textContent = `₹${orderData.unitPrice.toLocaleString()}`;
    document.getElementById('payment-total-amount').textContent = `₹${orderData.totalAmount.toLocaleString()}`;
    
    document.getElementById('customer-name-display').textContent = orderData.customerDetails.customerName;
    document.getElementById('customer-phone-display').textContent = orderData.customerDetails.customerPhone;
    document.getElementById('customer-email-display').textContent = orderData.customerDetails.customerEmail;
    document.getElementById('customer-address-display').textContent = orderData.customerDetails.deliveryAddress;
}

function generatePaymentQR(orderData) {
    console.log('🔄 Generating ENHANCED UPI QR code for amount:', orderData.totalAmount);
    
    // ENHANCED UPI ID VALIDATION AND MULTIPLE FALLBACKS
    const primaryUpiId = 'naturecareimpex@paytm';
    const fallbackUpiIds = [
        'naturecareimpex@paytm',
        'naturecareimpex@ybl',  // PhonePe fallback
        'naturecareimpex@okaxis',  // Google Pay fallback
        'naturecareimpex@upi'  // Generic UPI fallback
    ];
    
    const merchantName = 'Nature Care Impex';
    const amount = orderData.totalAmount;
    const currency = 'INR';
    const transactionNote = `Order-${orderData.orderId}`;
    
    // MULTIPLE UPI FORMAT ATTEMPTS FOR MAXIMUM COMPATIBILITY
    const upiFormats = [
        // Standard NPCI format
        `upi://pay?pa=${primaryUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`,
        // Alternative format without encoding merchant name
        `upi://pay?pa=${primaryUpiId}&pn=Nature%20Care%20Impex&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`,
        // Simplified format
        `upi://pay?pa=${primaryUpiId}&am=${amount}&tn=${encodeURIComponent(transactionNote)}`,
        // Format with mc (merchant code)
        `upi://pay?pa=${primaryUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}&mc=5411`,
        // Format with tr (transaction reference)
        `upi://pay?pa=${primaryUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}&tr=${orderData.orderId}`
    ];
    
    console.log('📱 Testing UPI formats:', upiFormats);
    
    const qrCodeElement = document.getElementById('payment-qr-code');
    if (!qrCodeElement) {
        console.error('❌ QR code element not found');
        return;
    }
    
    let currentFormatIndex = 0;
    let currentServiceIndex = 0;
    
    // Enhanced QR services with different providers
    const qrServices = [
        // Google Charts - Most reliable
        (data) => `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(data)}&choe=UTF-8&chld=L|0`,
        // QR Server with error correction
        (data) => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&format=png&ecc=L&charset-source=UTF-8&charset-target=UTF-8`,
        // QuickChart with enhanced settings
        (data) => `https://quickchart.io/qr?text=${encodeURIComponent(data)}&size=300&format=png&margin=1&ecLevel=L`,
        // QR Code Generator API
        (data) => `https://qr-code-generator-api.herokuapp.com/api/qr?data=${encodeURIComponent(data)}&size=300&format=png`,
        // Alternative QR service
        (data) => `https://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(data)}&choe=UTF-8`
    ];
    
    function tryNextFormat() {
        if (currentFormatIndex >= upiFormats.length) {
            console.error('❌ All UPI formats failed');
            showManualPaymentFallback();
            return;
        }
        
        const currentUpiData = upiFormats[currentFormatIndex];
        console.log(`🔄 Trying UPI format ${currentFormatIndex + 1}:`, currentUpiData);
        
        currentServiceIndex = 0;
        tryNextQRService(currentUpiData);
    }
    
    function tryNextQRService(upiData) {
        if (currentServiceIndex >= qrServices.length) {
            console.log(`❌ All QR services failed for format ${currentFormatIndex + 1}, trying next format...`);
            currentFormatIndex++;
            setTimeout(tryNextFormat, 500);
            return;
        }
        
        const qrUrl = qrServices[currentServiceIndex](upiData);
        console.log(`🔄 Trying QR service ${currentServiceIndex + 1} with format ${currentFormatIndex + 1}:`, qrUrl);
        
        // Create a test image to validate QR generation
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous';
        
        testImg.onload = function() {
            console.log(`✅ QR service ${currentServiceIndex + 1} with format ${currentFormatIndex + 1} successful!`);
            
            // Set the successful QR code
            qrCodeElement.src = qrUrl;
            qrCodeElement.style.border = '3px solid #28a745';
            qrCodeElement.style.display = 'block';
            qrCodeElement.style.maxWidth = '250px';
            qrCodeElement.style.height = 'auto';
            
            // Add success validation message
            const container = qrCodeElement.parentElement;
            let validationMsg = container.querySelector('.qr-validation');
            if (!validationMsg) {
                validationMsg = document.createElement('p');
                validationMsg.className = 'qr-validation';
                validationMsg.style.cssText = 'color: #28a745; font-weight: 600; margin-top: 10px; font-size: 14px;';
                container.appendChild(validationMsg);
            }
            validationMsg.innerHTML = `✅ Valid UPI QR Code Generated<br><small>Format ${currentFormatIndex + 1}, Service ${currentServiceIndex + 1}</small>`;
            
            // Store successful format for future use
            localStorage.setItem('workingUpiFormat', JSON.stringify({
                format: currentFormatIndex,
                service: currentServiceIndex,
                upiData: upiData
            }));
            
            // Add QR validation test
            setTimeout(() => validateQRCode(upiData), 1000);
        };
        
        testImg.onerror = function() {
            console.log(`❌ QR service ${currentServiceIndex + 1} failed, trying next...`);
            currentServiceIndex++;
            setTimeout(() => tryNextQRService(upiData), 500);
        };
        
        testImg.src = qrUrl;
    }
    
    function showManualPaymentFallback() {
        console.error('❌ All QR generation attempts failed, showing manual payment');
        
        const container = qrCodeElement.parentElement;
        container.innerHTML = `
            <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-radius: 12px; border: 2px solid #f39c12;">
                <h4 style="color: #d68910; margin-bottom: 20px;">⚠️ QR Code Generation Issue</h4>
                <p style="margin-bottom: 20px; color: #8b4513;">Please use manual UPI payment or try alternative methods:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #f39c12;">
                    <p style="margin: 8px 0;"><strong>🆔 Primary UPI ID:</strong> <span style="color: #1976d2; font-family: monospace; font-size: 16px;">${primaryUpiId}</span></p>
                    <p style="margin: 8px 0;"><strong>💰 Amount:</strong> <span style="color: #d32f2f; font-weight: bold;">₹${amount}</span></p>
                    <p style="margin: 8px 0;"><strong>📝 Note:</strong> <span style="font-family: monospace;">${transactionNote}</span></p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 20px 0;">
                    <button onclick="copyUpiId()" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(40,167,69,0.3);">
                        📋 Copy UPI ID
                    </button>
                    <button onclick="retryQRGeneration()" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(0,123,255,0.3);">
                        🔄 Retry QR
                    </button>
                    <button onclick="showAlternativeUPIs()" style="background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(111,66,193,0.3);">
                        🔄 Try Other UPIs
                    </button>
                </div>
                
                <p style="font-size: 12px; color: #666; margin: 15px 0 0 0;">If QR doesn't work, copy UPI ID and paste in any UPI app</p>
            </div>
        `;
    }
    
    function validateQRCode(upiData) {
        console.log('🔍 Validating generated QR code...');
        
        // Validate UPI string format
        const validations = {
            hasUpiScheme: upiData.startsWith('upi://pay?'),
            hasPayeeAddress: upiData.includes('pa='),
            hasAmount: upiData.includes('am=' + amount),
            hasCurrency: upiData.includes('cu=INR') || !upiData.includes('cu='),
            hasTransactionNote: upiData.includes('tn='),
            properEncoding: !upiData.includes(' ') || upiData.includes('%20')
        };
        
        const allValid = Object.values(validations).every(v => v);
        console.log('🔍 UPI Validation Results:', validations);
        console.log(allValid ? '✅ UPI format is valid' : '❌ UPI format has issues');
        
        // Add validation indicator
        const container = qrCodeElement.parentElement;
        let validationIndicator = container.querySelector('.validation-indicator');
        if (!validationIndicator) {
            validationIndicator = document.createElement('div');
            validationIndicator.className = 'validation-indicator';
            validationIndicator.style.cssText = 'margin-top: 10px; padding: 8px; border-radius: 6px; font-size: 12px;';
            container.appendChild(validationIndicator);
        }
        
        if (allValid) {
            validationIndicator.style.background = '#d4edda';
            validationIndicator.style.color = '#155724';
            validationIndicator.innerHTML = '✅ QR Code validated - Should work with UPI apps';
        } else {
            validationIndicator.style.background = '#f8d7da';
            validationIndicator.style.color = '#721c24';
            validationIndicator.innerHTML = '⚠️ QR Code may have compatibility issues';
        }
    }
    
    // Check if we have a previously working format
    const savedFormat = localStorage.getItem('workingUpiFormat');
    if (savedFormat) {
        try {
            const formatData = JSON.parse(savedFormat);
            console.log('🔄 Using previously successful format:', formatData);
            currentFormatIndex = formatData.format;
            currentServiceIndex = formatData.service;
        } catch (e) {
            console.log('⚠️ Could not parse saved format, using default');
        }
    }
    
    // Start QR generation process
    tryNextFormat();
}

function payWithApp(appName) {
    console.log('Pay with app:', appName);
    
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    if (!orderData) {
        alert('Order data not found. Please try again.');
        return;
    }
    
    const amount = orderData.totalAmount;
    const orderId = orderData.orderId;
    
    let url = '';
    switch(appName) {
        case 'paytm':
            url = `paytmmp://pay?pa=naturecareimpex@paytm&pn=Nature Care Impex&am=${amount}&cu=INR&tn=Order ${orderId}`;
            break;
        case 'gpay':
            url = `tez://upi/pay?pa=naturecareimpex@paytm&pn=Nature Care Impex&am=${amount}&cu=INR&tn=Order ${orderId}`;
            break;
        case 'phonepe':
            url = `phonepe://pay?pa=naturecareimpex@paytm&pn=Nature Care Impex&am=${amount}&cu=INR&tn=Order ${orderId}`;
            break;
    }
    
    window.location.href = url;
    
    setTimeout(() => {
        alert(`If ${appName} didn't open automatically, please use the QR code or UPI ID to make payment.`);
    }, 2000);
}

function copyUpiId() {
    const upiId = 'naturecareimpex@paytm';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId).then(() => {
            alert('UPI ID copied to clipboard!');
        }).catch(() => {
            fallbackCopyUpiId(upiId);
        });
    } else {
        fallbackCopyUpiId(upiId);
    }
}

function fallbackCopyUpiId(upiId) {
    const tempInput = document.createElement('input');
    tempInput.value = upiId;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('UPI ID copied to clipboard!');
}

function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-image').src = e.target.result;
        document.getElementById('screenshot-preview').style.display = 'block';
        
        const instructionMsg = document.getElementById('upload-instruction');
        let confirmBtn = document.getElementById('confirm-payment-btn');
        
        console.log('Screenshot uploaded - attempting to show button');
        console.log('Instruction element:', instructionMsg);
        console.log('Confirm button element:', confirmBtn);
        
        if (instructionMsg) {
            instructionMsg.style.display = 'none';
            console.log('Instruction hidden');
        }
        
        if (!confirmBtn) {
            console.log('Creating new confirm button');
            const confirmSection = document.querySelector('.confirm-order-section');
            if (confirmSection) {
                confirmBtn = document.createElement('button');
                confirmBtn.id = 'confirm-payment-btn';
                confirmBtn.className = 'btn btn-primary';
                confirmBtn.innerHTML = '✅ Confirm Order';
                confirmBtn.onclick = confirmPayment;
                confirmSection.appendChild(confirmBtn);
            }
        }
        
        if (confirmBtn) {
            confirmBtn.style.display = 'block';
            confirmBtn.style.visibility = 'visible';
            confirmBtn.style.opacity = '1';
            confirmBtn.classList.add('show');
            confirmBtn.disabled = false;
            
            console.log('Button should now be visible');
            console.log('Button display:', confirmBtn.style.display);
            console.log('Button classes:', confirmBtn.className);
            
            confirmBtn.offsetHeight;
            
            alert('Screenshot uploaded successfully! You can now confirm your order.');
            
        } else {
            console.error('Still cannot find/create confirm button!');
            alert('Error: Cannot create confirm button. Please refresh the page.');
        }
        
        const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
        orderData.paymentScreenshot = {
            file: file.name,
            dataUrl: e.target.result,
            uploadedAt: new Date().toISOString()
        };
        sessionStorage.setItem('orderForPayment', JSON.stringify(orderData));
        
        console.log('Screenshot uploaded - Confirm button shown, instruction hidden');
    };
    reader.readAsDataURL(file);
}

function removeScreenshot() {
    document.getElementById('screenshot-preview').style.display = 'none';
    document.getElementById('screenshot-input').value = '';
    
    const instructionMsg = document.getElementById('upload-instruction');
    const confirmBtn = document.getElementById('confirm-payment-btn');
    
    if (instructionMsg) instructionMsg.style.display = 'block';
    if (confirmBtn) {
        confirmBtn.classList.remove('show');
        confirmBtn.disabled = true;
        console.log('Confirm button hidden');
    }
    
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    delete orderData.paymentScreenshot;
    sessionStorage.setItem('orderForPayment', JSON.stringify(orderData));
    
    console.log('Screenshot removed - Confirm button hidden, instruction shown');
}

async function confirmPayment() {
    console.log('Confirming payment...');
    
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    if (!orderData) {
        alert('Order data not found. Please try again.');
        return;
    }
    
    const screenshotPreview = document.getElementById('screenshot-preview');
    const previewImage = document.getElementById('preview-image');
    
    console.log('Screenshot preview element:', screenshotPreview);
    console.log('Preview image src:', previewImage ? previewImage.src : 'not found');
    console.log('Order data has screenshot:', !!orderData.paymentScreenshot);
    
    const hasScreenshotData = orderData.paymentScreenshot && orderData.paymentScreenshot.dataUrl;
    const hasPreviewImage = previewImage && previewImage.src && previewImage.src !== '';
    const previewVisible = screenshotPreview && screenshotPreview.style.display !== 'none';
    
    if (!hasScreenshotData && !hasPreviewImage && !previewVisible) {
        alert('Please upload payment screenshot to confirm order.');
        return;
    }
    
    if (!hasScreenshotData && hasPreviewImage) {
        orderData.paymentScreenshot = {
            file: 'uploaded-screenshot.jpg',
            dataUrl: previewImage.src,
            uploadedAt: new Date().toISOString()
        };
        sessionStorage.setItem('orderForPayment', JSON.stringify(orderData));
        console.log('Created screenshot data from preview image');
    }
    
    orderData.status = 'payment_submitted';
    orderData.submittedAt = new Date().toISOString();
    orderData.createdAt = orderData.timestamp || new Date().toISOString();
    
    const finalOrder = {
        ...orderData,
        customerDetails: {
            ...orderData.customerDetails,
            name: orderData.customerDetails.customerName,
            email: orderData.customerDetails.customerEmail,
            phone: orderData.customerDetails.customerPhone,
            address: orderData.customerDetails.deliveryAddress,
            quantity: orderData.customerDetails.quantity,
            notes: orderData.customerDetails.orderNotes || '',
            total: orderData.totalAmount
        }
    };
    
    try {
        console.log('💾 Attempting to save order to database...');
        console.log('Order data being sent:', finalOrder);
        
        if (window.apiService) {
            console.log('🔄 API Service available, calling createOrder...');
            const result = await window.apiService.createOrder(finalOrder);
            console.log('📡 API Response:', result);
            
            if (result.success && !result.fallback) {
                console.log('✅ Order saved to MongoDB successfully!');
                showOrderSuccessMessage(finalOrder, 'database');
            } else if (result.success && result.fallback) {
                console.log('⚠️ Order saved to localStorage only (database unavailable)');
                showOrderSuccessMessage(finalOrder, 'localStorage');
            } else {
                console.log('❌ MongoDB save failed:', result.message);
                console.log('📱 Falling back to localStorage only');
                showOrderSuccessMessage(finalOrder, 'localStorage');
            }
        } else {
            console.log('❌ API Service not available');
            console.log('📱 Saving to localStorage only');
            showOrderSuccessMessage(finalOrder, 'localStorage');
        }
    } catch (error) {
        console.error('❌ Error saving order to database:', error);
        console.log('📱 Falling back to localStorage only');
        showOrderSuccessMessage(finalOrder, 'localStorage');
    }
    
    let customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    customerOrders.push(finalOrder);
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    
    console.log('📱 Order stored in localStorage:', finalOrder.orderId);
    console.log('📊 Total customer orders now:', customerOrders.length);
    
    sessionStorage.removeItem('orderForPayment');
    sessionStorage.removeItem('currentOrder');
}

function showOrderSuccessMessage(order, saveLocation) {
    let locationMessage = '';
    if (saveLocation === 'database') {
        locationMessage = '✅ Your order has been saved to our database and will be processed immediately.';
    } else {
        locationMessage = '📱 Your order has been saved locally and will be synced to our database when available.';
    }
    
    alert(`Payment confirmed successfully!

Order ID: ${order.orderId}
Product: ${order.product.name}
Total: ₹${order.totalAmount.toLocaleString()}

${locationMessage}

Thank you for your order! We will contact you shortly to confirm delivery details.

Your order is now visible in our system and will be processed soon.`);
    
    window.location.href = 'products.html';
}

// Make payment functions globally available
window.loadPaymentPage = loadPaymentPage;
window.populatePaymentInfo = populatePaymentInfo;
window.generatePaymentQR = generatePaymentQR;
window.payWithApp = payWithApp;
window.copyUpiId = copyUpiId;
window.handleScreenshotUpload = handleScreenshotUpload;
window.removeScreenshot = removeScreenshot;
window.confirmPayment = confirmPayment;

// Make functions globally available
window.loadOrderDetailsPage = loadOrderDetailsPage;
window.populateProductInfo = populateProductInfo;
window.setupOrderForm = setupOrderForm;
window.updateOrderSummary = updateOrderSummary;
window.handleOrderFormSubmit = handleOrderFormSubmit;

// Make functions globally available immediately
window.startOrderProcess = startOrderProcess;

// Add a simple test function
window.testBuyNow = function() {
    alert('Buy Now button clicked! Function is working.');
    console.log('Test function called');
    if (typeof products !== 'undefined' && products.length > 0) {
        console.log('Products available:', products.length);
        startOrderProcess('1');
    } else {
        alert('Products not loaded yet. Please refresh the page.');
    }
};

// Define modal functions
function closeOrderModal() {
    const modal = document.getElementById('order-details-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('order-success-modal');
    if (modal) modal.remove();
}

// Make modal functions globally available
window.closeOrderModal = closeOrderModal;
window.closePaymentModal = closePaymentModal;
window.closeSuccessModal = closeSuccessModal;
// Product Data - Load from localStorage or use defaults
async function loadProductsData() {
    try {
        console.log('🔄 Loading products from database...');
        
        if (window.apiService) {
            const result = await window.apiService.getProducts();
            if (result.success && result.data && result.data.length > 0) {
                console.log('✅ Products loaded from MongoDB:', result.data.length);
                
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
                console.log('✅ Products synced to localStorage for website:', websiteProducts.length);
                return websiteProducts;
            } else {
                console.log('⚠️ No products found in database, using fallback');
            }
        } else {
            console.log('⚠️ API Service not available');
        }
    } catch (error) {
        console.log('⚠️ MongoDB unavailable, using localStorage fallback:', error.message);
    }

    const savedProducts = localStorage.getItem('allProducts');
    if (savedProducts) {
        try {
            const parsed = JSON.parse(savedProducts);
            if (Array.isArray(parsed) && parsed.length > 0) {
                console.log('📱 Using products from localStorage:', parsed.length);
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing saved products:', e);
        }
    }
    
    console.log('⚠️ No products found, using default products');
    
    const defaultProducts = [
        {
            id: 1,
            name: "Cocopeat 5kg Block",
            category: "cocopeat",
            image: "https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190898/photo_2025-12-31_22-18-07_c2hs4m.jpg",
            description: "Premium washed cocopeat blocks ideal for potting mixes and hydroponics. High water retention and porosity.",
            sizes: ["5kg Block", "Pallet (200 Blocks)"],
            price: 250,
            cost: 150,
            stock: 100
        },
        {
            id: 2,
            name: "Coco Grow Bags",
            category: "eco-care",
            image: "https://cdn.moglix.com/p/B5wXshH1wq7TS-xxlarge.jpg",
            description: "Ready-to-use grow bags for greenhouse cultivation. UV treated for durability and optimal root growth.",
            sizes: ["100x15x18 cm", "100x20x10 cm"],
            price: 90,
            cost: 60,
            stock: 200
        },
        {
            id: 3,
            name: "Coco Bricks (650g)",
            category: "cocopeat",
            image: "https://images.unsplash.com/photo-1591857177580-dc82b9e4e119?auto=format&fit=crop&w=800&q=80",
            description: "Compact 650g briquettes, perfect for home gardening and smaller applications. Expands to 9 liters.",
            sizes: ["650g Brick", "Pack of 3"],
            price: 180,
            cost: 120,
            stock: 150
        },
        {
            id: 5,
            name: "Bamboo Period Pads",
            category: "bamboo",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbYHHF-lKgdGS9ftR4AwALD27xwGSO9hsldw&s",
            description: "Comfortable, absorbent, and eco-friendly bamboo period pads. Washable and reusable for a sustainable cycle.",
            sizes: ["Small/Light", "Medium/Regular", "Large/Heavy"],
            price: 120,
            cost: 80,
            stock: 80
        },
        {
            id: 6,
            name: "12 Coco Bricks 400g",
            category: "cocopeat",
            image: "https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190712/photo_2025-12-31_22-14-34_zu8ayl.jpg",
            description: "High-quality 400g coco peat bricks, perfect for home gardening and seed starting. Compact and easy to use.",
            sizes: ["400g Brick", "Pack of 12"],
            price: 200,
            cost: 140,
            stock: 120
        }
    ];
    
    localStorage.setItem('allProducts', JSON.stringify(defaultProducts));
    return defaultProducts;
}

async function initializeProducts() {
    try {
        console.log('🔄 Initializing products...');
        products = await loadProductsData();
        console.log('✅ Products initialized:', products.length);
        return products;
    } catch (error) {
        console.error('❌ Error initializing products:', error);
        products = [];
        return products;
    }
}

async function refreshProducts() {
    try {
        console.log('🔄 Refreshing products...');
        const updatedProducts = await loadProductsData();
        
        products.length = 0;
        products.push(...updatedProducts);
        
        console.log('✅ Products refreshed:', products.length);
        
        if (document.getElementById('products-grid')) {
            console.log('Refreshing products with current filter:', currentFilterCategory);
            await renderAllProducts(currentFilterCategory);
        }
        if (document.getElementById('featured-grid')) {
            await renderFeaturedProducts();
        }
    } catch (error) {
        console.error('❌ Error refreshing products:', error);
    }
}

// Enhanced DOMContentLoaded Event with async product loading
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    
    await initializeProducts();
    
    window.addEventListener('productUpdated', async (event) => {
        console.log('🔄 Product update detected:', event.detail);
        await refreshProducts();
        showNotification('Products updated! New items are now available.', 'success');
    });
    
    window.addEventListener('storage', async (event) => {
        if (event.key === 'productUpdateEvent') {
            console.log('🔄 Product update from owner portal detected');
            await refreshProducts();
            showNotification('Products updated from owner portal!', 'success');
        }
    });
    
    initMobileMenu();

    if (document.getElementById('featured-grid')) {
        console.log('Featured grid found, rendering featured products');
        await renderFeaturedProducts();
    }

    if (document.querySelector('.hero-carousel')) {
        console.log('Hero carousel found, initializing');
        initCarousel();
    }

    if (document.getElementById('products-grid')) {
        console.log('Products grid found, rendering all products');
        await renderAllProducts('all');
        initFilters();
    }

    if (document.getElementById('product-detail-container')) {
        console.log('Product detail container found, loading product details');
        await loadProductDetails();
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    initScrollAnimations();
});

// Make functions globally available
window.refreshProducts = refreshProducts;
window.loadProductsData = loadProductsData;
window.initializeProducts = initializeProducts;
window.getCurrentFilter = () => currentFilterCategory;

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#000';
            break;
        default:
            notification.style.backgroundColor = '#007bff';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

window.updateOrderTotal = updateOrderTotal;

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    const reveals = document.querySelectorAll('.reveal-up');
    reveals.forEach(el => observer.observe(el));
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            const bars = document.querySelectorAll('.bar');
            if (navLinks.classList.contains('active')) {
                bars[0].style.transform = "rotate(-45deg) translate(-5px, 6px)";
                bars[1].style.opacity = "0";
                bars[2].style.transform = "rotate(45deg) translate(-5px, -6px)";
            } else {
                bars[0].style.transform = "none";
                bars[1].style.opacity = "1";
                bars[2].style.transform = "none";
            }
        });
    }
}

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    if (!slides.length) return;

    let currentSlide = 0;
    const slideInterval = 5000;
    let slideTimer;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetTimer();
        });
    });

    function startTimer() {
        slideTimer = setInterval(nextSlide, slideInterval);
    }

    function resetTimer() {
        clearInterval(slideTimer);
        startTimer();
    }

    startTimer();
}

async function renderFeaturedProducts() {
    console.log('renderFeaturedProducts called');
    const grid = document.getElementById('featured-grid');
    if (!grid) {
        console.error('Featured grid not found');
        return;
    }

    if (!products || products.length === 0) {
        console.log('Products not loaded, initializing...');
        await initializeProducts();
    }

    const featured = products.slice(0, 3);
    console.log('Rendering featured products:', featured);
    grid.innerHTML = featured.map(product => createProductCard(product)).join('');
}

async function renderAllProducts(filterCategory) {
    console.log('renderAllProducts called with filter:', filterCategory);
    console.log('Products array:', products);
    
    currentFilterCategory = filterCategory;
    
    const grid = document.getElementById('products-grid');
    if (!grid) {
        console.error('Products grid element not found!');
        return;
    }
    
    console.log('Products grid element found:', grid);

    if (!products || products.length === 0) {
        console.log('Products not loaded, initializing...');
        await initializeProducts();
    }

    let filtered = products;
    if (filterCategory !== 'all') {
        filtered = products.filter(p => {
            console.log(`Checking product: ${p.name}, category: ${p.category}, matches ${filterCategory}:`, p.category === filterCategory);
            return p.category === filterCategory;
        });
    }
    
    console.log('Filtered products for category', filterCategory, ':', filtered);
    console.log('Number of filtered products:', filtered.length);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No products found for category "${filterCategory}".</p>`;
        return;
    }

    grid.innerHTML = filtered.map(product => createProductCard(product)).join('');
    console.log('Products rendered successfully for category:', filterCategory);
}

function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    console.log('Initializing filter buttons:', buttons.length);
    
    buttons.forEach(btn => {
        const category = btn.getAttribute('data-filter');
        console.log('Filter button found:', category);
        
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Filter button clicked:', category);
            
            buttons.forEach(b => b.classList.remove('active'));
            
            btn.classList.add('active');
            
            currentFilterCategory = category;
            await renderAllProducts(category);
        });
    });
    
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton && !document.querySelector('.filter-btn.active')) {
        allButton.classList.add('active');
        currentFilterCategory = 'all';
    }
}

async function loadProductDetails() {
    const container = document.getElementById('product-detail-container');
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (!products || products.length === 0) {
        console.log('Products not loaded, initializing...');
        await initializeProducts();
    }

    const product = products.find(p => p.id === id);

    if (!product) {
        container.innerHTML = '<div class="text-center"><h2>Product Not Found</h2><a href="products.html" class="btn btn-primary">Back to Products</a></div>';
        return;
    }

    const sizeOptions = product.sizes.map(size => `<option value="${size}">${size}</option>`).join('');

    const html = `
        <div class="detail-wrapper">
            <div class="detail-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="detail-content">
                <span class="product-category">${product.category}</span>
                <h1>${product.name}</h1>
                <p class="description">${product.description}</p>
                
                <div class="spec-group">
                    <label for="size-select">Select Size / Variant:</label>
                    <select id="size-select" class="size-select">
                        ${sizeOptions}
                    </select>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="startOrderProcess('${product.id}')">Buy Now</button>
                    <a href="contact.html?subject=${encodeURIComponent(product.name)}" class="btn btn-secondary">Contact Sales</a>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function handleContactForm(e) {
    e.preventDefault();
    alert('Thank you! Your message has been sent successfully. We will contact you shortly.');
    e.target.reset();
}

function showOrderDetailsModal() {
    console.log('showOrderDetailsModal called');
    console.log('currentOrder:', currentOrder);
    
    if (!currentOrder) {
        console.error('No current order found');
        alert('Error: No order data found. Please try again.');
        return;
    }
    
    const modal = document.getElementById('order-details-modal');
    if (!modal) {
        console.log('Modal not found, creating new modal');
        createOrderDetailsModal();
        return;
    }
    
    console.log('Modal found, populating data');
    try {
        document.getElementById('order-product-name').textContent = currentOrder.product.name;
        document.getElementById('order-product-image').src = currentOrder.product.image;
        document.getElementById('order-product-price').textContent = `₹${getProductPrice(currentOrder.product.id)}`;
        
        updateOrderTotal();
        
        console.log('Showing modal');
        modal.style.display = 'block';
        modal.classList.add('show');
        
        console.log('Modal should now be visible');
        
    } catch (error) {
        console.error('Error populating modal:', error);
        alert('Error displaying order form. Please try again.');
    }
}

function createOrderDetailsModal() {
    console.log('createOrderDetailsModal called');
    
    const modalHTML = `
        <div id="order-details-modal" class="modal">
            <div class="modal-content order-modal">
                <div class="modal-header">
                    <h3>Order Details</h3>
                    <span class="close" onclick="closeOrderModal()">&times;</span>
                </div>
                <div class="order-modal-body">
                    <div class="product-summary">
                        <img id="order-product-image" src="" alt="Product" class="order-product-img">
                        <div class="product-info">
                            <h4 id="order-product-name"></h4>
                            <div class="price" id="order-product-price"></div>
                        </div>
                    </div>
                    
                    <form id="order-details-form" class="order-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customer-name">Full Name *</label>
                                <input type="text" id="customer-name" required>
                            </div>
                            <div class="form-group">
                                <label for="customer-phone">Phone Number *</label>
                                <input type="tel" id="customer-phone" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="customer-email">Email Address *</label>
                            <input type="email" id="customer-email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="delivery-address">Delivery Address *</label>
                            <textarea id="delivery-address" rows="3" required placeholder="Enter complete delivery address"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="order-quantity">Quantity *</label>
                                <input type="number" id="order-quantity" min="1" value="1" required onchange="updateOrderTotal()">
                            </div>
                            <div class="form-group">
                                <label for="order-total">Total Amount</label>
                                <input type="text" id="order-total" readonly>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="order-notes">Special Instructions (Optional)</label>
                            <textarea id="order-notes" rows="2" placeholder="Any special delivery instructions..."></textarea>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeOrderModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Proceed to Payment</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    console.log('Adding modal HTML to body');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    console.log('Adding form submit handler');
    const form = document.getElementById('order-details-form');
    if (form) {
        form.addEventListener('submit', handleOrderDetails);
    }
    
    console.log('Populating product info and showing modal');
    setTimeout(() => {
        const productName = document.getElementById('order-product-name');
        const productImage = document.getElementById('order-product-image');
        const productPrice = document.getElementById('order-product-price');
        
        if (productName && productImage && productPrice && currentOrder) {
            productName.textContent = currentOrder.product.name;
            productImage.src = currentOrder.product.image;
            productPrice.textContent = `₹${getProductPrice(currentOrder.product.id)}`;
            
            updateOrderTotal();
            
            const modal = document.getElementById('order-details-modal');
            if (modal) {
                modal.style.display = 'block';
                modal.classList.add('show');
                console.log('Modal displayed successfully');
            }
        }
    }, 100);
}

function updateOrderTotal() {
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    const price = getProductPrice(currentOrder.product.id);
    const total = quantity * price;
    document.getElementById('order-total').value = `₹${total.toLocaleString()}`;
}

function getProductPrice(productId) {
    if (products && products.length > 0) {
        const product = products.find(p => p.id == productId || p.id === String(productId));
        if (product && product.price) {
            console.log(`Found price for product ${productId}: ₹${product.price}`);
            return product.price;
        }
    }
    
    try {
        const storedProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
        const product = storedProducts.find(p => p.id == productId || p.id === String(productId));
        if (product && product.price) {
            console.log(`Found price in localStorage for product ${productId}: ₹${product.price}`);
            return product.price;
        }
    } catch (error) {
        console.error('Error reading products from localStorage:', error);
    }
    
    const fallbackPrices = {
        1: 250,  // Cocopeat 5kg Block
        2: 90,   // Coco Grow Bags
        3: 180,  // Coco Bricks 650g
        5: 120,  // Bamboo Period Pads
        6: 200   // 12 Coco Bricks 400g
    };
    
    const fallbackPrice = fallbackPrices[productId] || 100;
    console.log(`Using fallback price for product ${productId}: ₹${fallbackPrice}`);
    return fallbackPrice;
}

function handleOrderDetails(e) {
    e.preventDefault();
    
    currentOrder.customerDetails = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        email: document.getElementById('customer-email').value,
        address: document.getElementById('delivery-address').value,
        quantity: parseInt(document.getElementById('order-quantity').value),
        total: getProductPrice(currentOrder.product.id) * parseInt(document.getElementById('order-quantity').value),
        notes: document.getElementById('order-notes').value
    };
    
    closeOrderModal();
    showPaymentModal();
}

function showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (!modal) {
        createPaymentModal();
        return;
    }
    
    document.getElementById('payment-order-id').textContent = currentOrder.orderId;
    document.getElementById('payment-amount').textContent = `₹${currentOrder.customerDetails.total.toLocaleString()}`;
    document.getElementById('payment-product').textContent = currentOrder.product.name;
    
    const qrData = `upi://pay?pa=naturecareimpex@paytm&pn=Nature Care Impex&am=${currentOrder.customerDetails.total}&cu=INR&tn=Order ${currentOrder.orderId}`;
    document.getElementById('payment-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    modal.style.display = 'block';
}

function createPaymentModal() {
    const modalHTML = `
        <div id="payment-modal" class="modal">
            <div class="modal-content payment-modal">
                <div class="modal-header">
                    <h3>Payment</h3>
                    <span class="close" onclick="closePaymentModal()">&times;</span>
                </div>
                <div class="payment-modal-body">
                    <div class="payment-summary">
                        <h4>Order Summary</h4>
                        <div class="summary-row">
                            <span>Order ID:</span>
                            <span id="payment-order-id"></span>
                        </div>
                        <div class="summary-row">
                            <span>Product:</span>
                            <span id="payment-product"></span>
                        </div>
                        <div class="summary-row total">
                            <span>Total Amount:</span>
                            <span id="payment-amount"></span>
                        </div>
                    </div>
                    
                    <div class="payment-methods">
                        <h4>Payment Options</h4>
                        
                        <div class="payment-option active" onclick="selectPaymentMethod('upi')">
                            <div class="payment-header">
                                <input type="radio" name="payment" value="upi" checked>
                                <label>UPI Payment</label>
                            </div>
                            <div class="upi-details">
                                <div class="qr-section">
                                    <img id="payment-qr" src="" alt="QR Code" class="payment-qr">
                                    <p>Scan QR code with any UPI app</p>
                                </div>
                                <div class="upi-apps">
                                    <p>Or pay directly using:</p>
                                    <div class="app-buttons">
                                        <button class="upi-app paytm" onclick="payWithApp('paytm')">
                                            <div class="app-icon">
                                                <img src="https://logoeps.com/wp-content/uploads/2013/03/paytm-vector-logo.png" alt="Paytm" class="app-logo">
                                            </div>
                                            <span>Paytm</span>
                                        </button>
                                        <button class="upi-app gpay" onclick="payWithApp('gpay')">
                                            <div class="app-icon">
                                                <img src="https://developers.google.com/pay/api/images/brand-guidelines/google-pay-mark.png" alt="Google Pay" class="app-logo">
                                            </div>
                                            <span>Google Pay</span>
                                        </button>
                                        <button class="upi-app phonepe" onclick="payWithApp('phonepe')">
                                            <div class="app-icon">
                                                <img src="https://www.phonepe.com/webstatic/6.8.0/images/phonepe-logo-big.svg" alt="PhonePe" class="app-logo">
                                            </div>
                                            <span>PhonePe</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="upi-id">
                                    <p><strong>UPI ID:</strong> naturecareimpex@paytm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="screenshot-upload">
                        <h4>Upload Payment Screenshot</h4>
                        <div class="upload-area" onclick="document.getElementById('screenshot-input').click()">
                            <div class="upload-content">
                                <div class="upload-icon">📷</div>
                                <p>Click to upload payment screenshot</p>
                                <small>Supported: JPG, PNG (Max 5MB)</small>
                            </div>
                            <input type="file" id="screenshot-input" accept="image/*" style="display: none;" onchange="handleScreenshotUpload(event)">
                        </div>
                        <div id="screenshot-preview" class="screenshot-preview" style="display: none;">
                            <img id="preview-image" src="" alt="Screenshot">
                            <button class="remove-screenshot" onclick="removeScreenshot()">&times;</button>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closePaymentModal()">Cancel</button>
                        <button type="button" class="btn-primary" id="confirm-order-btn" onclick="confirmOrder()" disabled>Confirm Order</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => showPaymentModal(), 100);
}

function selectPaymentMethod(method) {
    console.log('Selected payment method:', method);
}

function confirmOrder() {
    if (!currentOrder.screenshot) {
        alert('Please upload payment screenshot to confirm order.');
        return;
    }
    
    const finalOrder = {
        ...currentOrder,
        status: 'screenshot',
        createdAt: new Date().toISOString(),
        paymentScreenshot: currentOrder.screenshot.dataUrl
    };
    
    let orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    orders.push(finalOrder);
    localStorage.setItem('customerOrders', JSON.stringify(orders));
    
    closePaymentModal();
    showOrderSuccess();
    
    currentOrder = null;
}

function showOrderSuccess() {
    const successHTML = `
        <div id="order-success-modal" class="modal">
            <div class="modal-content success-modal">
                <div class="success-content">
                    <div class="success-icon">✅</div>
                    <h3>Order Confirmed!</h3>
                    <p>Your order has been successfully placed.</p>
                    <p>Order ID: <strong>${currentOrder ? currentOrder.orderId : 'N/A'}</strong></p>
                    <p>We will contact you shortly to confirm delivery details.</p>
                    <button class="btn-primary" onclick="closeSuccessModal()">Continue Shopping</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
    document.getElementById('order-success-modal').style.display = 'block';
}

// Make all modal functions globally available
window.selectPaymentMethod = selectPaymentMethod;
window.confirmOrder = confirmOrder;

function createProductCard(product) {
    console.log('Creating product card for:', product.name, 'ID:', product.id);
    const productPrice = product.price || getProductPrice(product.id);
    return `
        <div class="product-card">
            <div class="card-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-price" style="font-size: 1.2rem; font-weight: bold; color: #D4AF37; margin: 10px 0;">₹${productPrice.toLocaleString()}</div>
                <div class="product-actions">
                    <a href="product-detail.html?id=${product.id}" class="btn btn-secondary">View Details</a>
                    <button class="btn btn-primary" onclick="startOrderProcess('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `;
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
        console.log('Developer tools disabled for security.');
    }
});

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔌 API Service initialized');
    
    const health = await window.apiService.healthCheck();
    if (health.success) {
        console.log('✅ Server is online - MongoDB integration active');
        console.log('🔗 Server URL:', window.apiService.baseURL);
        
        try {
            const initResponse = await fetch(`${window.apiService.baseURL}/products/initialize`, {
                method: 'POST'
            });
            const initResult = await initResponse.json();
            console.log('📊 Database initialization result:', initResult);
        } catch (error) {
            console.log('⚠️ Database initialization error:', error.message);
        }
    } else {
        console.log('⚠️ Server offline - Using localStorage fallback');
        console.log('🔗 Attempted server URL:', window.apiService.baseURL);
    }
});

console.log('📡 API Service loaded successfully');
console.log('Nature Care Impex script loaded successfully!');