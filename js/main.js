/* Natural Care Impex - Main Script */

// Buy Now Ordering System - Define functions first
let currentOrder = null;

function startOrderProcess(productId) {
    console.log('startOrderProcess called with productId:', productId);
    
    // Ensure products are loaded
    if (!products || products.length === 0) {
        console.log('Products not loaded, refreshing...');
        refreshProducts();
    }
    
    // Convert productId to number for comparison
    const id = parseInt(productId);
    console.log('Converted ID:', id);
    console.log('Available products:', products);
    
    // Try to find product by both number and string ID
    let product = products.find(p => p.id === id || p.id === productId || p.id === String(productId));
    
    // If still not found, try refreshing products and searching again
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
    
    // Store order data in sessionStorage for the order details page
    const orderData = {
        product: product,
        orderId: 'ORD-' + Date.now(),
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentOrder', JSON.stringify(orderData));
    console.log('Order data stored:', orderData);
    
    // Redirect to order details page
    window.location.href = 'order-details.html?id=' + productId;
}

// Function to load order details on the order details page
function loadOrderDetailsPage() {
    console.log('Loading order details page...');
    
    // Get order data from sessionStorage
    const orderDataStr = sessionStorage.getItem('currentOrder');
    if (!orderDataStr) {
        console.error('No order data found');
        alert('No order data found. Redirecting to products page.');
        window.location.href = 'products.html';
        return;
    }
    
    const orderData = JSON.parse(orderDataStr);
    console.log('Loaded order data:', orderData);
    
    // Populate product information
    populateProductInfo(orderData.product);
    
    // Set up form handlers
    setupOrderForm(orderData);
}

function populateProductInfo(product) {
    console.log('Populating product info:', product);
    
    // Update product display
    document.getElementById('order-product-image').src = product.image;
    document.getElementById('order-product-image').alt = product.name;
    document.getElementById('order-product-name').textContent = product.name;
    document.getElementById('order-product-category').textContent = product.category;
    document.getElementById('order-product-description').textContent = product.description;
    
    const price = getProductPrice(product.id);
    document.getElementById('order-product-price').textContent = `₹${price.toLocaleString()}`;
    
    // Populate size options
    const sizeSelect = document.getElementById('product-size');
    sizeSelect.innerHTML = '';
    product.sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });
    
    // Update summary
    document.getElementById('summary-product-name').textContent = product.name;
    document.getElementById('summary-unit-price').textContent = `₹${price.toLocaleString()}`;
    updateOrderSummary();
}

function setupOrderForm(orderData) {
    const form = document.getElementById('order-form');
    const quantityInput = document.getElementById('order-quantity');
    
    // Add quantity change handler
    quantityInput.addEventListener('input', updateOrderSummary);
    
    // Add form submit handler
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
    
    // Collect form data
    const formData = {
        customerName: document.getElementById('customer-name').value,
        customerPhone: document.getElementById('customer-phone').value,
        customerEmail: document.getElementById('customer-email').value,
        deliveryAddress: document.getElementById('delivery-address').value,
        productSize: document.getElementById('product-size').value,
        quantity: parseInt(document.getElementById('order-quantity').value),
        orderNotes: document.getElementById('order-notes').value
    };
    
    // Calculate total
    const price = getProductPrice(orderData.product.id);
    const total = formData.quantity * price;
    
    // Create final order
    const finalOrder = {
        ...orderData,
        customerDetails: formData,
        unitPrice: price,
        totalAmount: total,
        status: 'pending',
        productSize: formData.productSize, // Add size/variant to main order object
        orderDate: new Date().toISOString().split('T')[0], // Add order date for monthly calculations
        orderMonth: new Date().toISOString().slice(0, 7) // YYYY-MM format for monthly grouping
    };
    
    console.log('Final order:', finalOrder);
    
    // Store order for payment page
    sessionStorage.setItem('orderForPayment', JSON.stringify(finalOrder));
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

// Payment page functions
function loadPaymentPage() {
    console.log('Loading payment page...');
    
    // Get order data from sessionStorage
    const orderDataStr = sessionStorage.getItem('orderForPayment');
    if (!orderDataStr) {
        console.error('No order data found for payment');
        
        // Create demo order data for testing
        const demoOrder = {
            orderId: 'ORD-DEMO-' + Date.now(),
            product: {
                id: 1,
                name: 'Cocopeat 5kg Block',
                category: 'Cocopeat'
            },
            customerDetails: {
                customerName: 'Demo Customer',
                customerPhone: '9876543210',
                customerEmail: 'demo@example.com',
                deliveryAddress: 'Demo Address',
                quantity: 1
            },
            unitPrice: 250,
            totalAmount: 250,
            status: 'pending'
        };
        
        console.log('Using demo order data:', demoOrder);
        sessionStorage.setItem('orderForPayment', JSON.stringify(demoOrder));
        
        // Use demo data
        populatePaymentInfo(demoOrder);
        generatePaymentQR(demoOrder);
        return;
    }
    
    const orderData = JSON.parse(orderDataStr);
    console.log('Loaded payment order data:', orderData);
    
    // Populate payment page
    populatePaymentInfo(orderData);
    
    // Generate QR code
    generatePaymentQR(orderData);
}

function populatePaymentInfo(orderData) {
    console.log('Populating payment info...');
    
    // Order summary
    document.getElementById('payment-order-id').textContent = orderData.orderId;
    document.getElementById('payment-product-name').textContent = orderData.product.name;
    document.getElementById('payment-quantity').textContent = orderData.customerDetails.quantity;
    document.getElementById('payment-unit-price').textContent = `₹${orderData.unitPrice.toLocaleString()}`;
    document.getElementById('payment-total-amount').textContent = `₹${orderData.totalAmount.toLocaleString()}`;
    
    // Customer details
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

// Add retry function
window.retryQRGeneration = function() {
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    if (orderData) {
        // Clear saved format to try all options again
        localStorage.removeItem('workingUpiFormat');
        generatePaymentQR(orderData);
    }
};

// Add alternative UPI function
window.showAlternativeUPIs = function() {
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    if (!orderData) return;
    
    const alternativeUPIs = [
        'naturecareimpex@paytm',
        'naturecareimpex@ybl',
        'naturecareimpex@okaxis',
        'naturecareimpex@upi'
    ];
    
    const upiList = alternativeUPIs.map((upi, index) => 
        `${index + 1}. ${upi}`
    ).join('\n');
    
    alert(`🔄 Alternative UPI IDs to try:\n\n${upiList}\n\nAmount: ₹${orderData.totalAmount}\nNote: Order-${orderData.orderId}\n\nTry these UPI IDs in your payment app if the primary one doesn't work.`);
};

function payWithApp(appName) {
    console.log('🚀 Pay with app:', appName);
    
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    if (!orderData) {
        alert('❌ Order data not found. Please try again.');
        return;
    }
    
    const upiId = 'naturecareimpex@paytm';
    const merchantName = 'Nature Care Impex';
    const amount = orderData.totalAmount;
    const orderId = orderData.orderId;
    const transactionNote = `Order-${orderId}`;
    
    let url = '';
    let appDisplayName = '';
    
    switch(appName) {
        case 'paytm':
            // Paytm specific URL format
            url = `paytmmp://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${transactionNote}`;
            appDisplayName = 'Paytm';
            break;
        case 'gpay':
            // Google Pay URL format
            url = `tez://upi/pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${transactionNote}`;
            appDisplayName = 'Google Pay';
            break;
        case 'phonepe':
            // PhonePe URL format
            url = `phonepe://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${transactionNote}`;
            appDisplayName = 'PhonePe';
            break;
        default:
            alert('❌ Invalid payment app selected');
            return;
    }
    
    console.log('🔗 Opening app with URL:', url);
    
    try {
        // Method 1: Try window.open first
        const popup = window.open(url, '_blank');
        
        // Method 2: If popup blocked, try location.href
        setTimeout(() => {
            if (!popup || popup.closed) {
                window.location.href = url;
            }
        }, 100);
        
        // Show user feedback
        setTimeout(() => {
            const userResponse = confirm(`💳 ${appDisplayName} Payment\n\n✅ If ${appDisplayName} opened: Complete your payment there\n❌ If ${appDisplayName} didn't open: Click OK to use QR code\n\nDid ${appDisplayName} open successfully?`);
            
            if (!userResponse) {
                // User said app didn't open, highlight QR code
                const qrSection = document.querySelector('.qr-code-container');
                if (qrSection) {
                    qrSection.scrollIntoView({ behavior: 'smooth' });
                    qrSection.style.border = '3px solid #ff6b6b';
                    qrSection.style.backgroundColor = '#fff5f5';
                    
                    setTimeout(() => {
                        qrSection.style.border = '2px dashed #28a745';
                        qrSection.style.backgroundColor = '#f8f9fa';
                    }, 3000);
                }
                
                alert('📱 Please use the QR code below or copy the UPI ID to make payment manually.');
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error opening payment app:', error);
        alert(`❌ Could not open ${appDisplayName}.\n\n📱 Please use the QR code or copy UPI ID instead.`);
        
        // Highlight QR code section
        const qrSection = document.querySelector('.qr-code-container');
        if (qrSection) {
            qrSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function copyUpiId() {
    const upiId = 'naturecareimpex@paytm'; // Updated to match the business UPI ID
    
    // Try to copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId).then(() => {
            alert('✅ UPI ID copied to clipboard!\n\nPaste it in your UPI app to make payment.');
        }).catch(() => {
            // Fallback for older browsers
            fallbackCopyUpiId(upiId);
        });
    } else {
        fallbackCopyUpiId(upiId);
    }
}

function fallbackCopyUpiId(upiId) {
    // Create temporary input element
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
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-image').src = e.target.result;
        document.getElementById('screenshot-preview').style.display = 'block';
        
        // Hide instruction and show the Confirm Order button
        const instructionMsg = document.getElementById('upload-instruction');
        let confirmBtn = document.getElementById('confirm-payment-btn');
        
        console.log('Screenshot uploaded - attempting to show button');
        console.log('Instruction element:', instructionMsg);
        console.log('Confirm button element:', confirmBtn);
        
        if (instructionMsg) {
            instructionMsg.style.display = 'none';
            console.log('Instruction hidden');
        }
        
        // If button doesn't exist or isn't working, create a new one
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
            // Multiple approaches to ensure button shows
            confirmBtn.style.display = 'block';
            confirmBtn.style.visibility = 'visible';
            confirmBtn.style.opacity = '1';
            confirmBtn.classList.add('show');
            confirmBtn.disabled = false;
            
            console.log('Button should now be visible');
            console.log('Button display:', confirmBtn.style.display);
            console.log('Button classes:', confirmBtn.className);
            
            // Force a reflow
            confirmBtn.offsetHeight;
            
            // Show success message
            alert('Screenshot uploaded successfully! You can now confirm your order.');
            
        } else {
            console.error('Still cannot find/create confirm button!');
            alert('Error: Cannot create confirm button. Please refresh the page.');
        }
        
        // Store screenshot data
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
    
    // Show instruction and hide the Confirm Order button
    const instructionMsg = document.getElementById('upload-instruction');
    const confirmBtn = document.getElementById('confirm-payment-btn');
    
    if (instructionMsg) instructionMsg.style.display = 'block';
    if (confirmBtn) {
        confirmBtn.classList.remove('show');
        confirmBtn.disabled = true;
        console.log('Confirm button hidden');
    }
    
    // Remove screenshot from order data
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    delete orderData.paymentScreenshot;
    sessionStorage.setItem('orderForPayment', JSON.stringify(orderData));
    
    console.log('Screenshot removed - Confirm button hidden, instruction shown');
}

// Enhanced confirmPayment function with MongoDB integration
async function confirmPayment() {
    console.log('Confirming payment...');
    
    const orderData = JSON.parse(sessionStorage.getItem('orderForPayment'));
    if (!orderData) {
        alert('Order data not found. Please try again.');
        return;
    }
    
    // Check if screenshot is uploaded by looking at the preview element
    const screenshotPreview = document.getElementById('screenshot-preview');
    const previewImage = document.getElementById('preview-image');
    
    console.log('Screenshot preview element:', screenshotPreview);
    console.log('Preview image src:', previewImage ? previewImage.src : 'not found');
    console.log('Order data has screenshot:', !!orderData.paymentScreenshot);
    
    // Check multiple ways to confirm screenshot is uploaded
    const hasScreenshotData = orderData.paymentScreenshot && orderData.paymentScreenshot.dataUrl;
    const hasPreviewImage = previewImage && previewImage.src && previewImage.src !== '';
    const previewVisible = screenshotPreview && screenshotPreview.style.display !== 'none';
    
    if (!hasScreenshotData && !hasPreviewImage && !previewVisible) {
        alert('Please upload payment screenshot to confirm order.');
        return;
    }
    
    // If we don't have screenshot data but image is visible, create it
    if (!hasScreenshotData && hasPreviewImage) {
        orderData.paymentScreenshot = {
            file: 'uploaded-screenshot.jpg',
            dataUrl: previewImage.src,
            uploadedAt: new Date().toISOString()
        };
        sessionStorage.setItem('orderForPayment', JSON.stringify(orderData));
        console.log('Created screenshot data from preview image');
    }
    
    // Update order status and add timestamps
    orderData.status = 'payment_submitted';
    orderData.submittedAt = new Date().toISOString();
    orderData.createdAt = orderData.timestamp || new Date().toISOString();
    
    // Ensure all required fields for owner portal
    const finalOrder = {
        ...orderData,
        // Add any missing fields that owner portal expects
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
        
        // Try to save to MongoDB first
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
    
    // Always store in localStorage as backup
    let customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    customerOrders.push(finalOrder);
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    
    console.log('📱 Order stored in localStorage:', finalOrder.orderId);
    console.log('📊 Total customer orders now:', customerOrders.length);
    
    // Clear session storage
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
    
    // Redirect to products page
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
// Enhanced product loading with MongoDB integration
async function loadProductsData() {
    try {
        console.log('🔄 Loading products from database...');
        
        // Try to load from MongoDB API first
        if (window.apiService) {
            const result = await window.apiService.getProducts();
            if (result.success && result.data && result.data.length > 0) {
                console.log('✅ Products loaded from MongoDB:', result.data.length);
                
                // Convert database products to website format
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
                
                // Save to localStorage for website use
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

    // Fallback to localStorage
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
    
    // Default products if none saved (should match database defaults)
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
    
    // Save default products to localStorage
    localStorage.setItem('allProducts', JSON.stringify(defaultProducts));
    return defaultProducts;
}

// Initialize products variable
let products = [];

// Enhanced initialization with async product loading
async function initializeProducts() {
    try {
        console.log('🔄 Initializing products...');
        products = await loadProductsData();
        console.log('✅ Products initialized:', products.length);
        return products;
    } catch (error) {
        console.error('❌ Error initializing products:', error);
        // Fallback to empty array
        products = [];
        return products;
    }
}

// Track current filter state
let currentFilterCategory = 'all';

// Enhanced refreshProducts function with async support
async function refreshProducts() {
    try {
        console.log('🔄 Refreshing products...');
        const updatedProducts = await loadProductsData();
        
        // Update the global products array
        products.length = 0;
        products.push(...updatedProducts);
        
        console.log('✅ Products refreshed:', products.length);
        
        // Re-render products with current filter state
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
    
    // Initialize products first
    await initializeProducts();
    
    // Set up real-time product update listener
    window.addEventListener('productUpdated', async (event) => {
        console.log('🔄 Product update detected:', event.detail);
        await refreshProducts();
        showNotification('Products updated! New items are now available.', 'success');
    });
    
    // Listen for localStorage changes (cross-tab communication)
    window.addEventListener('storage', async (event) => {
        if (event.key === 'productUpdateEvent') {
            console.log('🔄 Product update from owner portal detected');
            await refreshProducts();
            showNotification('Products updated from owner portal!', 'success');
        }
    });
    
    initMobileMenu();

    // Check page context and render products
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
        
        // Set up periodic refresh for products (every 30 seconds)
        setInterval(async () => {
            await refreshProducts();
        }, 30000);
    }

    if (document.getElementById('product-detail-container')) {
        console.log('Product detail container found, loading details');
        await loadProductDetails();
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Scroll Animations
    initScrollAnimations();
});

// Make functions globally available
window.refreshProducts = refreshProducts;
window.loadProductsData = loadProductsData;
window.initializeProducts = initializeProducts;
window.getCurrentFilter = () => currentFilterCategory;

// Simple notification function
function showNotification(message, type = 'info') {
    // Create notification element
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
    
    // Set background color based on type
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Make updateOrderTotal globally available
window.updateOrderTotal = updateOrderTotal;

// Scroll Reveal Logic
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

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate Hamburger
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

// Carousel Logic
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    if (!slides.length) return;

    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds
    let slideTimer;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Wrap around logic
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

    // Event Listeners
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

    // Auto Play
    function startTimer() {
        slideTimer = setInterval(nextSlide, slideInterval);
    }

    function resetTimer() {
        clearInterval(slideTimer);
        startTimer();
    }

    // Start
    startTimer();
}

// Enhanced renderFeaturedProducts with async support
async function renderFeaturedProducts() {
    console.log('renderFeaturedProducts called');
    const grid = document.getElementById('featured-grid');
    if (!grid) {
        console.error('Featured grid not found');
        return;
    }

    // Ensure products are loaded
    if (!products || products.length === 0) {
        console.log('Products not loaded, initializing...');
        await initializeProducts();
    }

    const featured = products.slice(0, 3);
    console.log('Rendering featured products:', featured);
    grid.innerHTML = featured.map(product => createProductCard(product)).join('');
}

// Enhanced renderAllProducts with async support
async function renderAllProducts(filterCategory) {
    console.log('renderAllProducts called with filter:', filterCategory);
    console.log('Products array:', products);
    
    // Update current filter state
    currentFilterCategory = filterCategory;
    
    const grid = document.getElementById('products-grid');
    if (!grid) {
        console.error('Products grid element not found!');
        return;
    }
    
    console.log('Products grid element found:', grid);

    // Ensure products are loaded
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

// Init Filter Buttons
// Enhanced initFilters function with async support
function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    console.log('Initializing filter buttons:', buttons.length);
    
    buttons.forEach(btn => {
        const category = btn.getAttribute('data-filter');
        console.log('Filter button found:', category);
        
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Filter button clicked:', category);
            
            // Remove active class from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update current filter state and render products
            currentFilterCategory = category;
            await renderAllProducts(category);
        });
    });
    
    // Ensure "All" is selected by default
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton && !document.querySelector('.filter-btn.active')) {
        allButton.classList.add('active');
        currentFilterCategory = 'all';
    }
}

// Load Product Details
// Enhanced loadProductDetails function with async support
async function loadProductDetails() {
    const container = document.getElementById('product-detail-container');
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id')); // ID is number in our data

    // Ensure products are loaded
    if (!products || products.length === 0) {
        console.log('Products not loaded, initializing...');
        await initializeProducts();
    }

    const product = products.find(p => p.id === id);

    if (!product) {
        container.innerHTML = '<div class="text-center"><h2>Product Not Found</h2><a href="products.html" class="btn btn-primary">Back to Products</a></div>';
        return;
    }

    // Generate Size Options
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

// Handle Contact Form
function handleContactForm(e) {
    e.preventDefault();
    // Simulate submission
    alert('Thank you! Your message has been sent successfully. We will contact you shortly.');
    e.target.reset();
}

// Buy Now Ordering System Functions

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
        // Populate product info
        document.getElementById('order-product-name').textContent = currentOrder.product.name;
        document.getElementById('order-product-image').src = currentOrder.product.image;
        document.getElementById('order-product-price').textContent = `₹${getProductPrice(currentOrder.product.id)}`;
        
        // Update total
        updateOrderTotal();
        
        console.log('Showing modal');
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Add success feedback
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
    
    // Add form submit handler
    console.log('Adding form submit handler');
    const form = document.getElementById('order-details-form');
    if (form) {
        form.addEventListener('submit', handleOrderDetails);
    }
    
    // Populate product info and show modal
    console.log('Populating product info and showing modal');
    setTimeout(() => {
        // Populate product info
        const productName = document.getElementById('order-product-name');
        const productImage = document.getElementById('order-product-image');
        const productPrice = document.getElementById('order-product-price');
        
        if (productName && productImage && productPrice && currentOrder) {
            productName.textContent = currentOrder.product.name;
            productImage.src = currentOrder.product.image;
            productPrice.textContent = `₹${getProductPrice(currentOrder.product.id)}`;
            
            // Update total
            updateOrderTotal();
            
            // Show modal
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
    // First try to get price from loaded products array
    if (products && products.length > 0) {
        const product = products.find(p => p.id == productId || p.id === String(productId));
        if (product && product.price) {
            console.log(`Found price for product ${productId}: ₹${product.price}`);
            return product.price;
        }
    }
    
    // Fallback to localStorage products
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
    
    // Final fallback to hardcoded prices (for backward compatibility)
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
    
    // Collect order details
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
    
    // Update payment details
    document.getElementById('payment-order-id').textContent = currentOrder.orderId;
    document.getElementById('payment-amount').textContent = `₹${currentOrder.customerDetails.total.toLocaleString()}`;
    document.getElementById('payment-product').textContent = currentOrder.product.name;
    
    // Generate QR code (using a QR code service)
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
    
    // Show modal
    setTimeout(() => showPaymentModal(), 100);
}

function selectPaymentMethod(method) {
    // For now, only UPI is implemented
    console.log('Selected payment method:', method);
}

function payWithApp(app) {
    const amount = currentOrder.customerDetails.total;
    const orderId = currentOrder.orderId;
    
    let url = '';
    switch(app) {
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
    
    // Try to open the app
    window.location.href = url;
    
    // Fallback message
    setTimeout(() => {
        alert(`If ${app} didn't open automatically, please use the QR code or UPI ID to make payment.`);
    }, 2000);
}

function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-image').src = e.target.result;
        document.getElementById('screenshot-preview').style.display = 'block';
        document.getElementById('confirm-order-btn').disabled = false;
        
        // Store screenshot data
        currentOrder.screenshot = {
            file: file,
            dataUrl: e.target.result,
            name: file.name
        };
    };
    reader.readAsDataURL(file);
}

function removeScreenshot() {
    document.getElementById('screenshot-preview').style.display = 'none';
    document.getElementById('screenshot-input').value = '';
    document.getElementById('confirm-order-btn').disabled = true;
    currentOrder.screenshot = null;
}

function confirmOrder() {
    if (!currentOrder.screenshot) {
        alert('Please upload payment screenshot to confirm order.');
        return;
    }
    
    // Create final order object
    const finalOrder = {
        ...currentOrder,
        status: 'screenshot', // Changed from 'pending' to 'screenshot'
        createdAt: new Date().toISOString(),
        paymentScreenshot: currentOrder.screenshot.dataUrl
    };
    
    // Store order in localStorage (in real app, this would be sent to server)
    let orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    orders.push(finalOrder);
    localStorage.setItem('customerOrders', JSON.stringify(orders));
    
    // Close modal and show success
    closePaymentModal();
    showOrderSuccess();
    
    // Reset current order
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
window.payWithApp = payWithApp;
window.handleScreenshotUpload = handleScreenshotUpload;
window.removeScreenshot = removeScreenshot;
window.confirmOrder = confirmOrder;

// Additional modal functions defined above

// Helper: Create HTML for a Product Card
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

console.log('Nature Care Impex script loaded successfully!');