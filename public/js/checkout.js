// Checkout page functionality

// Use global cart manager
let cart = [];

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    // Ensure cart manager is available
    if (window.cartManager) {
        cart = window.cartManager.getCart();
        console.log('Checkout page loaded, cart items:', cart.length);
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', function(event) {
            cart = event.detail.cart;
            loadCheckoutItems();
            updateCheckoutTotals();
            
            // Check if cart is now empty
            if (cart.length === 0 || cart.every(item => item.quantity === 0)) {
                showEmptyCartMessage();
            }
        });
    } else {
        console.error('Cart manager not available');
    }
    
    loadCheckoutItems();
    updateCheckoutTotals();
    setupEventListeners();
    
    // Check if cart is empty
    if (cart.length === 0 || cart.every(item => item.quantity === 0)) {
        showEmptyCartMessage();
    }
});

// Load cart items into checkout page
function loadCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    const emptyCartNotice = document.getElementById('emptyCartNotice');
    
    // Filter out items with quantity 0 for checkout
    const itemsToCheckout = cart.filter(item => item.quantity > 0);
    
    if (itemsToCheckout.length === 0) {
        checkoutItems.classList.add('hidden');
        emptyCartNotice.classList.remove('hidden');
        return;
    }
    
    checkoutItems.classList.remove('hidden');
    emptyCartNotice.classList.add('hidden');
    
    checkoutItems.innerHTML = itemsToCheckout.map(item => `
        <div class="checkout-item bg-white rounded-lg p-4 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md" data-item-id="${item.id}">
            <div class="flex items-center justify-between">
                <div class="checkout-item-info flex-1">
                    <h4 class="font-semibold text-gray-800 text-lg mb-1">${item.name}</h4>
                    <p class="text-gray-600 text-sm mb-2">
                        <span class="inline-flex items-center">
                            <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${getColorHex(item.color)}"></span>
                            ${item.color}
                        </span>
                        <span class="mx-2">•</span>
                        <span>${item.scent}</span>
                    </p>
                    <p class="text-indigo-600 font-semibold">€${item.price.toFixed(2)} each</p>
                </div>
                
                <div class="checkout-item-controls flex items-center space-x-4">
                    <!-- Quantity Controls -->
                    <div class="quantity-controls flex items-center bg-gray-100 rounded-lg border border-gray-300">
                        <button class="quantity-btn decrease-btn p-2 hover:bg-gray-200 rounded-l-lg transition duration-200" 
                                onclick="updateQuantity(${item.id}, ${item.quantity - 1})"
                                ${item.quantity <= 1 ? 'disabled' : ''}>
                            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                            </svg>
                        </button>
                        
                        <input type="number" 
                               class="quantity-input w-16 text-center bg-transparent border-0 focus:outline-none font-semibold" 
                               value="${item.quantity}" 
                               min="1" 
                               max="99"
                               onchange="updateQuantity(${item.id}, parseInt(this.value))"
                               onkeydown="if(event.key==='Enter') this.blur()">
                        
                        <button class="quantity-btn increase-btn p-2 hover:bg-gray-200 rounded-r-lg transition duration-200" 
                                onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Item Total Price -->
                    <div class="item-total text-right min-w-[80px]">
                        <div class="text-lg font-bold text-gray-800">€${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    
                    <!-- Remove Button -->
                    <button class="remove-btn p-2 text-red-500 hover:bg-red-50 rounded-lg transition duration-200" 
                            onclick="removeItem(${item.id})"
                            title="Remove item">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to get color hex values
function getColorHex(colorName) {
    const colorMap = {
        'White': '#FFFFFF',
        'Black': '#000000',
        'Red': '#EF4444',
        'Blue': '#3B82F6',
        'Green': '#10B981',
        'Yellow': '#F59E0B',
        'Purple': '#8B5CF6',
        'Pink': '#EC4899',
        'Orange': '#F97316',
        'Gray': '#6B7280',
        'Brown': '#92400E',
        'Light Blue': '#7DD3FC',
        'Light Green': '#86EFAC'
    };
    return colorMap[colorName] || '#6B7280';
}

// Update item quantity
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        // Find the item first to get its details for removal
        const item = cart.find(item => item.id === itemId);
        if (item) {
            removeItem(itemId);
        }
        return;
    }
    
    if (newQuantity > 99) {
        newQuantity = 99;
    }
    
    if (window.cartManager) {
        // Update quantity using cart manager
        const success = window.cartManager.updateQuantity(itemId, newQuantity);
        
        if (success) {
            // Refresh the display
            cart = window.cartManager.getCart();
            loadCheckoutItems();
            updateCheckoutTotals();
        }
    }
}

// Remove item from cart
function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        if (window.cartManager) {
            // Remove item using the removeItem method
            window.cartManager.removeItem(itemId);
            
            // Refresh the display
            cart = window.cartManager.getCart();
            loadCheckoutItems();
            updateCheckoutTotals();
            
            // Check if cart is empty
            if (cart.length === 0 || cart.every(item => item.quantity === 0)) {
                showEmptyCartMessage();
            }
        }
    }
}

// Update checkout totals
function updateCheckoutTotals() {
    const itemsToCheckout = cart.filter(item => item.quantity > 0);
    const subtotal = itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 3.99 : 0;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `€${shipping.toFixed(2)}`;
    document.getElementById('finalTotal').textContent = `€${total.toFixed(2)}`;
}

// Show empty cart message
function showEmptyCartMessage() {
    const checkoutContainer = document.querySelector('.checkout-content');
    checkoutContainer.innerHTML = `
        <div class="empty-checkout col-span-2">
            <h3>Your cart is empty</h3>
            <p>Add some items to your cart before proceeding to checkout.</p>
            <a href="shop.html" class="continue-shopping">Continue Shopping</a>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Cart functionality is now handled by cart-ui.js
}

// Handle form submission
function handleFormSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const customerInfo = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        postalCode: formData.get('postalCode'),
        country: formData.get('country'),
        cardNumber: formData.get('cardNumber'),
        cardName: formData.get('cardName'),
        expiryDate: formData.get('expiryDate'),
        cvv: formData.get('cvv')
    };
    
    // Validate form
    if (!validateForm(customerInfo)) {
        return;
    }
    
    // Process order
    processOrder(customerInfo);
}

// Validate form data
function validateForm(customerInfo) {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'country', 'cardNumber', 'cardName', 'expiryDate', 'cvv'];
    
    for (let field of requiredFields) {
        if (!customerInfo[field] || customerInfo[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            document.getElementById(field).focus();
            return false;
        }
    }
    
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(customerInfo.email)) {
        alert('Please enter a valid email address.');
        document.getElementById('email').focus();
        return false;
    }
    
    // Validate card number
    if (!validateCardNumber(customerInfo.cardNumber)) {
        alert('Please enter a valid credit card number.');
        document.getElementById('cardNumber').focus();
        return false;
    }
    
    // Validate expiry date
    if (!validateExpiryDate(customerInfo.expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY) that is not in the past.');
        document.getElementById('expiryDate').focus();
        return false;
    }
    
    // Validate CVV
    const cvvPattern = /^[0-9]{3,4}$/;
    if (!cvvPattern.test(customerInfo.cvv)) {
        alert('Please enter a valid CVV (3-4 digits).');
        document.getElementById('cvv').focus();
        return false;
    }
    
    return true;
}

// Process the order
function processOrder(customerInfo) {
    // Get items to checkout (quantity > 0)
    const itemsToCheckout = cart.filter(item => item.quantity > 0);
    
    if (itemsToCheckout.length === 0) {
        alert('Your cart is empty. Please add items before proceeding.');
        return;
    }
    
    // Create order object
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        customer: customerInfo,
        items: itemsToCheckout,
        subtotal: itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: 3.99,
        total: itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 3.99
    };
    
    // Process order and send email
    const purchaseBtn = document.getElementById('purchaseBtn');
    purchaseBtn.disabled = true;
    purchaseBtn.textContent = 'Processing...';

    // Send order data to PHP backend
    sendOrderEmail(order)
        .then(response => {
            if (response.success) {
                console.log('Order email sent successfully');
                
                // Clear cart items that were purchased
                if (window.cartManager) {
                    window.cartManager.clearCart();
                    cart = window.cartManager.getCart();
                }
                
                // Show success message
                alert(`Thank you for your order, ${customerInfo.firstName}! Your order #${order.id} has been confirmed. You will receive a confirmation email shortly.`);
                
                // Redirect to home page
                
                setTimeout(() => {
                   // window.location.href = 'index.html';
                }, 1000);
            } else {
                throw new Error(response.message || 'Failed to process order');
            }
        })
        .catch(error => {
            console.error('Error processing order:', error);
            alert('There was an error processing your order. Please try again or contact support.');
            
            // Re-enable the button
            purchaseBtn.disabled = false;
            purchaseBtn.textContent = 'Complete Purchase';
        });
}

// Send order email via PHP backend
async function sendOrderEmail(order) {
    try {
        const response = await fetch('send_order_email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending order email:', error);
        throw error;
    }
}

// Payment form formatting functions
function formatCardNumber(input) {
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 16 digits
    value = value.substring(0, 16);
    
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    input.value = value;
}

function formatExpiryDate(input) {
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 4 digits
    value = value.substring(0, 4);
    
    // Add slash after 2 digits
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    input.value = value;
}

// Validate credit card number using Luhn algorithm
function validateCardNumber(cardNumber) {
    // Remove spaces and non-digits
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        return false;
    }
    
    let sum = 0;
    let alternate = false;
    
    // Loop through digits from right to left
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber.charAt(i));
        
        if (alternate) {
            digit *= 2;
            if (digit > 9) {
                digit = (digit % 10) + 1;
            }
        }
        
        sum += digit;
        alternate = !alternate;
    }
    
    return (sum % 10) === 0;
}

// Validate expiry date
function validateExpiryDate(expiryDate) {
    const parts = expiryDate.split('/');
    if (parts.length !== 2) return false;
    
    const month = parseInt(parts[0]);
    const year = parseInt('20' + parts[1]);
    
    if (month < 1 || month > 12) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }
    
    return true;
}
