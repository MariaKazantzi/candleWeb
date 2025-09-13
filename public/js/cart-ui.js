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
        
        // Force refresh from localStorage to get latest cart state
        if (window.cartManager) {
            window.cartManager.cart = window.cartManager.loadCart();
        }
        
        this.cart = window.cartManager.getCart();
        console.log('CartUI initialized, cart items:', this.cart.length);
        console.log('CartUI initialized, cart contents:', this.cart);
        
        // Immediately update display with current cart
        this.updateCartDisplay();
        
        // Listen for cart updates from cart manager
        window.addEventListener('cartUpdated', (event) => {
            this.cart = event.detail.cart;
            this.updateCartDisplay();
            
            // Trigger page-specific cart updates
            this.triggerPageSpecificUpdates();
        });
        
        // Listen for specific cart action events
        window.addEventListener('cartItemAdded', (event) => {
            console.log('CartUI: Received cartItemAdded event');
            this.refresh();
        });
        
        window.addEventListener('cartItemRemoved', (event) => {
            console.log('CartUI: Received cartItemRemoved event');
            this.refresh();
        });
        
        window.addEventListener('cartQuantityChanged', (event) => {
            console.log('CartUI: Received cartQuantityChanged event');
            this.refresh();
        });
        
        // Listen for storage changes (when cart is updated from other tabs/windows)
        window.addEventListener('storage', (event) => {
            if (event.key === 'simplyScented_cart') {
                this.cart = window.cartManager.getCart();
                this.updateCartDisplay();
                this.triggerPageSpecificUpdates();
            } else if (event.key === 'cartBroadcast' && event.newValue) {
                // Handle broadcast updates from other tabs
                try {
                    const broadcast = JSON.parse(event.newValue);
                    if (broadcast.type === 'cartUpdate') {
                        console.log('CartUI: Received cart broadcast from another tab');
                        this.cart = window.cartManager.getCart();
                        this.updateCartDisplay();
                        this.updatePageSpecificElements();
                    }
                } catch (error) {
                    console.error('Error parsing cart broadcast:', error);
                }
            }
        });
        
        // Listen for page visibility changes to refresh cart
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('Page became visible, refreshing cart');
                this.forceCartRefresh();
            }
        });
        
        // Listen for page focus to refresh cart
        window.addEventListener('focus', () => {
            console.log('Window focused, refreshing cart');
            this.forceCartRefresh();
        });
        
        // Periodically sync cart to handle any missed updates
        setInterval(() => {
            this.refreshCartFromStorage();
        }, 3000); // Every 3 seconds (reduced from 5)
        
        this.setupEventListeners();
        
        // Force initial update to ensure cart display is correct
        this.updateCartDisplay();
        
        // Add a slight delay to ensure all DOM elements are ready
        setTimeout(() => {
            this.forceCartRefresh();
        }, 200);
        
        this.isInitialized = true;
    }
    
    forceCartRefresh() {
        // Force reload cart from localStorage
        if (window.cartManager) {
            const freshCart = window.cartManager.loadCart();
            window.cartManager.cart = freshCart;
            this.cart = freshCart;
            console.log('Forced cart refresh, items found:', this.cart.length);
            this.updateCartDisplay();
            this.triggerPageSpecificUpdates();
        }
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
        
        // Add to cart button (for product pages) - Only on non-product pages
        // Product pages handle their own Add to Cart functionality via products.js
        const isProductPage = window.location.pathname.includes('product');
        if (!isProductPage) {
            const addToCartBtn = document.getElementById('addToCartBtn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => this.addToCart());
            }
        }
    }
    
    updateCartDisplay() {
        console.log('Updating cart display, cart items:', this.cart.length);
        console.log('Cart contents:', this.cart);
        
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartCount || !cartItems || !cartTotal) {
            console.warn('Cart elements not found, retrying in 100ms');
            // If elements aren't found, try again in a moment
            setTimeout(() => this.updateCartDisplay(), 100);
            return;
        }
        
        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'flex'; // Always show for consistency
        
        console.log('Updated cart count to:', totalItems);
        
        // Add visual indication if cart has items
        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            if (totalItems > 0) {
                cartButton.classList.add('has-items');
            } else {
                cartButton.classList.remove('has-items');
            }
        }
        
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
            name: 'FirstProduct', // This could be dynamic based on the product page
            price: 4,
            color: color,
            scent: scent,
            quantity: quantity
        };
        
        // Use the global cart manager to add the item
        if (window.cartManager) {
            console.log('CartUI: Adding item to cart:', product);
            window.cartManager.addItem(product);
            this.cart = window.cartManager.getCart();
            this.updateCartDisplay();
            
            // Trigger cross-page update
            this.triggerPageSpecificUpdates();
            
            // Dispatch custom event for other components
            window.dispatchEvent(new CustomEvent('cartItemAdded', { 
                detail: { product: product, cart: this.cart }
            }));
            
            // Show success feedback
            this.showAddToCartFeedback();
            
            console.log('CartUI: Item added, new cart size:', this.cart.length);
        } else {
            console.error('Global cart manager not available');
        }
    }
    
    removeFromCart(itemId) {
        if (!window.cartManager) {
            console.error('Global cart manager not available');
            return;
        }

        console.log('CartUI: Removing item with ID:', itemId);
        window.cartManager.removeItem(itemId);
        this.cart = window.cartManager.getCart();
        
        // Store dropdown state before updating
        const dropdown = document.getElementById('cartDropdown');
        const wasOpen = dropdown && !dropdown.classList.contains('hidden');
        
        this.updateCartDisplay();
        
        // Trigger cross-page update
        this.triggerPageSpecificUpdates();
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('cartItemRemoved', { 
            detail: { itemId: itemId, cart: this.cart }
        }));
        
        // Keep dropdown open if it was open before
        if (wasOpen && dropdown) {
            dropdown.classList.remove('hidden');
        }
        
        console.log('CartUI: Item removed, new cart size:', this.cart.length);
    }
    
    updateQuantity(itemId, action) {
        console.log('CartUI: updateQuantity called with:', itemId, action);
        
        if (!window.cartManager) {
            console.error('Global cart manager not available');
            return;
        }
        
        const oldCart = [...this.cart];
        
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
        
        // Trigger cross-page update
        this.triggerPageSpecificUpdates();
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('cartQuantityChanged', { 
            detail: { itemId: itemId, action: action, cart: this.cart }
        }));
        
        // Keep dropdown open if it was open before
        if (wasOpen && dropdown) {
            dropdown.classList.remove('hidden');
        }
        
        console.log('CartUI: Quantity updated, new cart:', this.cart.map(item => `${item.name}: ${item.quantity}`));
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
        // Only show feedback on non-product pages (product pages handle their own feedback)
        const isProductPage = window.location.pathname.includes('product');
        if (!isProductPage) {
            const addToCartBtn = document.getElementById('addToCartBtn');
            if (addToCartBtn) {
                const originalText = addToCartBtn.textContent;
                addToCartBtn.textContent = 'Added to Cart!';
                addToCartBtn.style.backgroundColor = '#10B981'; // Green color
                
                setTimeout(() => {
                    addToCartBtn.textContent = originalText;
                    addToCartBtn.style.backgroundColor = ''; // Reset to original
                }, 2000);
            }
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
        
        // Broadcast to other tabs/windows via localStorage
        this.broadcastCartUpdate();
        
        // Update any page-specific cart displays
        this.updatePageSpecificElements();
    }
    
    broadcastCartUpdate() {
        // Use localStorage to broadcast cart updates to other tabs
        const broadcast = {
            type: 'cartUpdate',
            timestamp: Date.now(),
            cart: this.cart,
            totalItems: this.cart.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        // Temporarily store broadcast data
        localStorage.setItem('cartBroadcast', JSON.stringify(broadcast));
        
        // Remove it immediately (this triggers storage event in other tabs)
        setTimeout(() => {
            localStorage.removeItem('cartBroadcast');
        }, 100);
    }
    
    updatePageSpecificElements() {
        // Update any additional cart-related elements on the page
        const cartCountElements = document.querySelectorAll('.cart-count, .cart-badge, .header-cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            if (element.id !== 'cartCount') { // Don't update the main one twice
                element.textContent = totalItems;
                element.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        });
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
    
    refreshCartFromStorage() {
        if (window.cartManager) {
            // Force reload from localStorage
            const freshCart = window.cartManager.loadCart();
            const currentCartString = JSON.stringify(this.cart);
            const freshCartString = JSON.stringify(freshCart);
            
            // Only update if cart has actually changed
            if (currentCartString !== freshCartString) {
                console.log('Cart changed detected, updating from storage');
                console.log('Old cart:', this.cart);
                console.log('New cart:', freshCart);
                
                window.cartManager.cart = freshCart;
                this.cart = freshCart;
                this.updateCartDisplay();
                this.triggerPageSpecificUpdates();
            }
        }
    }
    
    // Debug function - can be called from browser console with window.cartUI.debugCart()
    debugCart() {
        console.log('=== CART DEBUG INFO ===');
        console.log('Cart instance exists:', !!window.cartUI);
        console.log('Cart array length:', this.cart.length);
        console.log('Cart contents:', JSON.stringify(this.cart, null, 2));
        console.log('localStorage cart:', localStorage.getItem('cart'));
        
        const cartElements = {
            cartCount: document.getElementById('cartCount'),
            cartItems: document.getElementById('cartItems'),
            cartTotal: document.getElementById('cartTotal'),
            cartButton: document.getElementById('cartButton')
        };
        
        console.log('Cart elements found:', Object.keys(cartElements).filter(key => cartElements[key]));
        console.log('Cart elements missing:', Object.keys(cartElements).filter(key => !cartElements[key]));
        
        if (cartElements.cartCount) {
            console.log('cartCount text content:', cartElements.cartCount.textContent);
            console.log('cartCount display style:', cartElements.cartCount.style.display);
        }
        
        console.log('=== END DEBUG INFO ===');
        
        return {
            cart: this.cart,
            elements: cartElements,
            localStorage: localStorage.getItem('cart')
        };
    }
}

// Initialize cart UI when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Create global cart UI instance
    if (typeof window !== 'undefined') {
        window.cartUI = new CartUI();
    }
});

// Also initialize on window load as fallback
window.addEventListener('load', function() {
    console.log('Window load event fired');
    
    if (!window.cartUI) {
        console.log('Creating new CartUI instance on window load');
        window.cartUI = new CartUI();
    } else if (window.cartUI && !window.cartUI.isInitialized) {
        console.log('Re-initializing existing CartUI');
        window.cartUI.initWhenReady();
    } else if (window.cartUI && window.cartUI.isInitialized) {
        console.log('Forcing cart refresh on page load');
        window.cartUI.forceCartRefresh();
    }
});

// Add a pageshow event listener for better navigation handling
window.addEventListener('pageshow', function(event) {
    console.log('Pageshow event fired, persisted:', event.persisted);
    
    if (window.cartUI && window.cartUI.isInitialized) {
        // Force refresh when page is shown (including back/forward navigation)
        setTimeout(() => {
            window.cartUI.forceCartRefresh();
        }, 100);
    }
});

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartUI;
}
