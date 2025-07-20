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
    
    // Filter out items with quantity 0 for checkout
    const itemsToCheckout = cart.filter(item => item.quantity > 0);
    
    if (itemsToCheckout.length === 0) {
        checkoutItems.innerHTML = '<p class="text-gray-500 text-center">No items to checkout</p>';
        return;
    }
    
    checkoutItems.innerHTML = itemsToCheckout.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-info">
                <h4>${item.name}</h4>
                <p>Color: ${item.color}, Scent: ${item.scent}</p>
            </div>
            <div class="checkout-item-details">
                <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
                <div class="checkout-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        </div>
    `).join('');
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
        country: formData.get('country')
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
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
    
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
    
    // Simulate order processing
    const purchaseBtn = document.getElementById('purchaseBtn');
    purchaseBtn.disabled = true;
    purchaseBtn.textContent = 'Processing...';
    
    setTimeout(() => {
        // Clear cart items that were purchased
        if (window.cartManager) {
            window.cartManager.clearCart();
            cart = window.cartManager.getCart();
        }
        
        // Show success message
        alert(`Thank you for your order, ${customerInfo.firstName}! Your order #${order.id} has been confirmed. You will receive a confirmation email shortly.`);
        
        // Redirect to home page
        window.location.href = 'index.html';
    }, 2000);
}
