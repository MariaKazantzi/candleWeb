// Shopping cart functionality and product page interactions

// Wait for cart manager to be available and get cart reference
let cart = [];

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Ensure global cart manager is available
    if (window.cartManager) {
        cart = window.cartManager.getCart();
        console.log('Products page loaded, cart items:', cart.length);
        
        // Listen for cart updates from other parts of the application
        window.addEventListener('cartUpdated', function(event) {
            cart = event.detail.cart;
            updateCartDisplay();
        });
    } else {
        console.error('Global cart manager not available');
    }
    
    // Initialize the page
    updateCartDisplay();
});

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
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
                event.stopPropagation(); // Prevent event bubbling
                const itemId = parseInt(this.getAttribute('data-item-id'));
                const action = this.getAttribute('data-action');
                updateQuantity(itemId, action);
            });
        });
        
        // Add event listeners to remove buttons
        const removeButtons = cartItems.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent event bubbling
                const itemId = parseInt(this.getAttribute('data-item-id'));
                removeFromCart(itemId);
            });
        });
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: €${total.toFixed(2)}`;
    
    // Add checkout button functionality
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        // Remove existing event listeners
        const newCheckoutBtn = checkoutBtn.cloneNode(true);
        checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
        
        // Add new event listener
        newCheckoutBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            redirectToCheckout();
        });
    }
}

// Add to cart function
function addToCart() {
    const color = document.getElementById('color').value;
    const scent = document.getElementById('scent').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Create the item to add
    const product = {
        name: 'Sexy Lavender',
        price: 4,
        color: color,
        scent: scent,
        quantity: quantity
    };
    
    // Use the global cart manager to add the item
    if (window.cartManager) {
        window.cartManager.addItem(product);
        cart = window.cartManager.getCart(); // Update local reference
        updateCartDisplay();
    } else {
        console.error('Global cart manager not available');
    }
}

// Remove from cart function
function removeFromCart(itemId) {
    if (window.cartManager) {
        window.cartManager.removeItem(itemId);
        cart = window.cartManager.getCart(); // Update local reference
        
        // Store dropdown state before updating
        const dropdown = document.getElementById('cartDropdown');
        const wasOpen = dropdown && !dropdown.classList.contains('hidden');
        
        updateCartDisplay();
        
        // Keep dropdown open if it was open before
        if (wasOpen && dropdown) {
            dropdown.classList.remove('hidden');
        }
    } else {
        console.error('Global cart manager not available');
    }
}

// Update quantity function
function updateQuantity(itemId, action) {
    if (!window.cartManager) {
        console.error('Global cart manager not available');
        return;
    }
    
    if (action === 'increase') {
        window.cartManager.increaseQuantity(itemId);
    } else if (action === 'decrease') {
        window.cartManager.decreaseQuantity(itemId);
    }
    
    cart = window.cartManager.getCart(); // Update local reference
    
    // Store dropdown state before updating
    const dropdown = document.getElementById('cartDropdown');
    const wasOpen = dropdown && !dropdown.classList.contains('hidden');
    
    updateCartDisplay();
    
    // Keep dropdown open if it was open before
    if (wasOpen && dropdown) {
        dropdown.classList.remove('hidden');
    }
}

// Toggle cart dropdown
function toggleCart() {
    const dropdown = document.getElementById('cartDropdown');
    dropdown.classList.toggle('hidden');
}

// Redirect to checkout page
function redirectToCheckout() {
    // Check if there are items with quantity > 0
    const itemsToCheckout = cart.filter(item => item.quantity > 0);
    
    if (itemsToCheckout.length === 0) {
        alert('Your cart is empty. Please add items before proceeding to checkout.');
        return;
    }
    
    // Determine the correct path based on current page
    const currentPath = window.location.pathname;
    let checkoutPath;
    
    if (currentPath.includes('/products/')) {
        // We're in a subdirectory
        checkoutPath = '../checkout.html';
    } else {
        // We're in the root directory
        checkoutPath = 'checkout.html';
    }
    
    window.location.href = checkoutPath;
}

// Image gallery function
function changeMainImage(thumbnail) {
    // Remove 'active' class from all thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-image');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));

    // Add 'active' class to the clicked thumbnail
    thumbnail.classList.add('active');

    // Change the main image source
    document.getElementById('mainImage').src = thumbnail.src;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Update cart display on page load
    updateCartDisplay();
    
    // Add event listeners
    const addToCartBtn = document.getElementById('addToCartBtn');
    const cartButton = document.getElementById('cartButton');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
    
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
});
