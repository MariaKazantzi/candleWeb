// Unified Cart UI Management
// This file handles all cart display and interaction functionality across all pages

class CartUI {
    constructor() {
        this.cart = [];
        this.isInitialized = false;
        
        // Wait for cart manager to be available
        this.initWhenReady();
    }
    
    initWhenReady() {
        if (window.cartManager) {
            this.init();
        } else {
            // Wait for cart manager to be available
            setTimeout(() => this.initWhenReady(), 100);
        }
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.cart = window.cartManager.getCart();
        console.log('CartUI initialized, cart items:', this.cart.length);
        
        // Listen for cart updates from cart manager
        window.addEventListener('cartUpdated', (event) => {
            this.cart = event.detail.cart;
            this.updateCartDisplay();
            
            // Trigger page-specific cart updates
            this.triggerPageSpecificUpdates();
        });
        
        this.setupEventListeners();
        this.updateCartDisplay();
        
        this.isInitialized = true;
    }
    
    setupEventListeners() {
        // Cart button toggle
        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            cartButton.addEventListener('click', () => this.toggleCart());
        }
        
        // Prevent cart dropdown from closing when clicking inside
        const cartDropdown = document.getElementById('cartDropdown');
        if (cartDropdown) {
            cartDropdown.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
        
        // Close cart dropdown when clicking outside
        document.addEventListener('click', (event) => {
            const cartContainer = document.querySelector('.cart-container');
            if (cartContainer && !cartContainer.contains(event.target)) {
                const cartDropdown = document.getElementById('cartDropdown');
                if (cartDropdown) {
                    cartDropdown.classList.add('hidden');
                }
            }
        });
        
        // Add to cart button (for product pages)
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }
    }
    
    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartCount || !cartItems || !cartTotal) return;
        
        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        
        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>Color: ${item.color}, Scent: ${item.scent}</p>
                    </div>
                    <div class="item-right">
                        <div class="quantity-controls">
                            <button data-item-id="${item.id}" data-action="decrease" class="quantity-btn" ${item.quantity === 1 ? 'disabled' : ''}>-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button data-item-id="${item.id}" data-action="increase" class="quantity-btn">+</button>
                        </div>
                        <div class="item-price">€${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <button data-item-id="${item.id}" class="remove-btn">×</button>
                </div>
            `).join('');
            
            this.setupCartItemListeners();
        }
        
        // Update total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: €${total.toFixed(2)}`;
        
        // Setup checkout button
        this.setupCheckoutButton();
    }
    
    setupCartItemListeners() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;
        
        // Add event listeners to quantity control buttons
        const quantityButtons = cartItems.querySelectorAll('.quantity-btn');
        quantityButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const itemIdStr = button.getAttribute('data-item-id');
                const itemId = parseInt(itemIdStr);
                const action = button.getAttribute('data-action');
                console.log('CartUI: Button clicked - raw ID:', itemIdStr, 'parsed ID:', itemId, 'action:', action);
                this.updateQuantity(itemId, action);
            });
        });
        
        // Add event listeners to remove buttons
        const removeButtons = cartItems.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const itemId = parseInt(button.getAttribute('data-item-id'));
                this.removeFromCart(itemId);
            });
        });
    }
    
    setupCheckoutButton() {
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            // Remove existing event listeners by cloning
            const newCheckoutBtn = checkoutBtn.cloneNode(true);
            checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
            
            // Add new event listener
            newCheckoutBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.redirectToCheckout();
            });
        }
    }
    
    addToCart() {
        const color = document.getElementById('color')?.value;
        const scent = document.getElementById('scent')?.value;
        const quantity = parseInt(document.getElementById('quantity')?.value || 1);
        
        if (!color || !scent) {
            alert('Please select both color and scent options.');
            return;
        }
        
        // Create the item to add
        const product = {
            name: 'Sexy Lavender', // This could be dynamic based on the product page
            price: 4,
            color: color,
            scent: scent,
            quantity: quantity
        };
        
        // Use the global cart manager to add the item
        if (window.cartManager) {
            window.cartManager.addItem(product);
            this.cart = window.cartManager.getCart();
            this.updateCartDisplay();
            
            // Show success feedback
            this.showAddToCartFeedback();
        } else {
            console.error('Global cart manager not available');
        }
    }
    
    removeFromCart(itemId) {
        if (!window.cartManager) {
            console.error('Global cart manager not available');
            return;
        }
        
        window.cartManager.removeItem(itemId);
        this.cart = window.cartManager.getCart();
        
        // Store dropdown state before updating
        const dropdown = document.getElementById('cartDropdown');
        const wasOpen = dropdown && !dropdown.classList.contains('hidden');
        
        this.updateCartDisplay();
        
        // Keep dropdown open if it was open before
        if (wasOpen && dropdown) {
            dropdown.classList.remove('hidden');
        }
    }
    
    updateQuantity(itemId, action) {
        console.log('CartUI: updateQuantity called with:', itemId, action);
        
        if (!window.cartManager) {
            console.error('Global cart manager not available');
            return;
        }
        
        if (action === 'increase') {
            window.cartManager.increaseQuantity(itemId);
        } else if (action === 'decrease') {
            window.cartManager.decreaseQuantity(itemId);
        }
        
        this.cart = window.cartManager.getCart();
        
        // Store dropdown state before updating
        const dropdown = document.getElementById('cartDropdown');
        const wasOpen = dropdown && !dropdown.classList.contains('hidden');
        
        this.updateCartDisplay();
        
        // Keep dropdown open if it was open before
        if (wasOpen && dropdown) {
            dropdown.classList.remove('hidden');
        }
    }
    
    toggleCart() {
        const dropdown = document.getElementById('cartDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }
    
    redirectToCheckout() {
        // Check if there are items with quantity > 0
        const itemsToCheckout = this.cart.filter(item => item.quantity > 0);
        
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
    
    showAddToCartFeedback() {
        // Simple feedback - you could enhance this with a toast notification
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            const originalText = addToCartBtn.textContent;
            addToCartBtn.textContent = 'Added to Cart!';
            addToCartBtn.style.backgroundColor = '#10B981'; // Green color
            
            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.style.backgroundColor = ''; // Reset to original
            }, 1500);
        }
    }
    
    triggerPageSpecificUpdates() {
        // Trigger page-specific cart update events
        if (typeof loadCheckoutItems === 'function') {
            loadCheckoutItems();
        }
        if (typeof updateCheckoutTotals === 'function') {
            updateCheckoutTotals();
        }
    }
    
    // Public methods for external use
    getCart() {
        return this.cart;
    }
    
    refresh() {
        if (window.cartManager) {
            this.cart = window.cartManager.getCart();
            this.updateCartDisplay();
        }
    }
}

// Initialize cart UI when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Create global cart UI instance
    if (typeof window !== 'undefined') {
        window.cartUI = new CartUI();
    }
});

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartUI;
}
