// Checkout page functionality

// Get cart data from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Cart functionality (reuse from products.js)
    setupCartFunctionality();
}

// Setup cart functionality for the header
function setupCartFunctionality() {
    updateCartDisplay();
    
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
        cartButton.addEventListener('click', toggleCart);
    }
    
    // Prevent cart dropdown from closing when clicking inside it
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown) {
        cartDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    // Close cart dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const cartContainer = document.querySelector('.cart-container');
        if (cartContainer && !cartContainer.contains(event.target)) {
            const cartDropdown = document.getElementById('cartDropdown');
            if (cartDropdown) {
                cartDropdown.classList.add('hidden');
            }
        }
    });
}

// Update cart display in header
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartCount || !cartItems || !cartTotal) return;
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Color: ${item.color}, Scent: ${item.scent}</p>
                </div>
                <div class="item-right">
                    <div class="quantity-controls">
                        <button data-item-id="${item.id}" data-action="decrease" class="quantity-btn" ${item.quantity === 0 ? 'disabled' : ''}>-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button data-item-id="${item.id}" data-action="increase" class="quantity-btn">+</button>
                    </div>
                    <div class="item-price">€${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <button data-item-id="${item.id}" class="remove-btn">×</button>
            </div>
        `).join('');
        
        // Add event listeners to quantity control buttons
        const quantityButtons = cartItems.querySelectorAll('.quantity-btn');
        quantityButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                const itemId = parseInt(this.getAttribute('data-item-id'));
                const action = this.getAttribute('data-action');
                updateQuantity(itemId, action);
            });
        });
        
        // Add event listeners to remove buttons
        const removeButtons = cartItems.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                const itemId = parseInt(this.getAttribute('data-item-id'));
                removeFromCart(itemId);
            });
        });
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: €${total.toFixed(2)}`;
}

// Update quantity function
function updateQuantity(itemId, action) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    if (action === 'increase') {
        cart[itemIndex].quantity += 1;
    } else if (action === 'decrease') {
        if (cart[itemIndex].quantity > 0) {
            cart[itemIndex].quantity -= 1;
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const dropdown = document.getElementById('cartDropdown');
    const wasOpen = dropdown && !dropdown.classList.contains('hidden');
    
    updateCartDisplay();
    loadCheckoutItems();
    updateCheckoutTotals();
    
    if (wasOpen && dropdown) {
        dropdown.classList.remove('hidden');
    }
}

// Remove from cart function
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const dropdown = document.getElementById('cartDropdown');
    const wasOpen = dropdown && !dropdown.classList.contains('hidden');
    
    updateCartDisplay();
    loadCheckoutItems();
    updateCheckoutTotals();
    
    if (wasOpen && dropdown) {
        dropdown.classList.remove('hidden');
    }
    
    // Check if cart is now empty
    if (cart.length === 0 || cart.every(item => item.quantity === 0)) {
        showEmptyCartMessage();
    }
}

// Toggle cart dropdown
function toggleCart() {
    const dropdown = document.getElementById('cartDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
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
        cart = cart.filter(item => item.quantity === 0);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show success message
        alert(`Thank you for your order, ${customerInfo.firstName}! Your order #${order.id} has been confirmed. You will receive a confirmation email shortly.`);
        
        // Redirect to home page
        window.location.href = 'index.html';
    }, 2000);
}
