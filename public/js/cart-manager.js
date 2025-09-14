// Shared cart management utility
// This file provides consistent cart management across all pages

class CartManager {
    constructor() {
        this.storageKey = 'simplyScented_cart';
        this.cart = this.loadCart();
        
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.cart = this.loadCart();
                // Dispatch custom event for other scripts to listen to
                window.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { cart: this.cart } 
                }));
            }
        });
    }
    
    loadCart() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            const cart = cartData ? JSON.parse(cartData) : [];
            //console.log('Cart loaded from localStorage:', cart);
            
            // Fix any decimal IDs to integers for consistency
            cart.forEach(item => {
                if (typeof item.id === 'number' && item.id % 1 !== 0) {
                    item.id = Math.floor(item.id);
                    //console.log('Fixed decimal ID to integer:', item.id);
                }
            });
            
            return cart;
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    }
    
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            //console.log('Cart saved to localStorage:', this.cart);
            
            // Dispatch event for components listening to cart changes
            window.dispatchEvent(new CustomEvent('cartUpdated', { 
                detail: { cart: this.cart } 
            }));
            
            return true;
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
            return false;
        }
    }
    
    getCart() {
        return [...this.cart]; // Return a copy to prevent external mutations
    }
    
    updateCart(newCart) {
        this.cart = [...newCart]; // Create a copy
        this.saveCart();
    }
    
    addItem(item) {
        // Check if item with same properties already exists
        const existingItemIndex = this.cart.findIndex(cartItem => 
            cartItem.name === item.name && 
            cartItem.color === item.color && 
            cartItem.scent === item.scent
        );
        
        if (existingItemIndex !== -1) {
            // Item exists, update quantity
            this.cart[existingItemIndex].quantity += item.quantity;
        } else {
            // New item, add to cart
            const newItem = {
                id: Date.now() + Math.floor(Math.random() * 1000), // Integer ID
                ...item
            };
            this.cart.push(newItem);
        }
        
        this.saveCart();
        return true;
    }
    
    removeItem(itemId) {
        const targetId = parseInt(itemId);
        this.cart = this.cart.filter(item => parseInt(item.id) !== targetId);
        this.saveCart();
    }
    
    updateQuantity(itemId, newQuantity) {
        const targetId = parseInt(itemId);
        const itemIndex = this.cart.findIndex(item => parseInt(item.id) === targetId);
        if (itemIndex !== -1) {
            if (newQuantity <= 0) {
                this.cart[itemIndex].quantity = 1; // Ensure minimum quantity is 1
            } else {
                this.cart[itemIndex].quantity = newQuantity;
            }
            this.saveCart();
            return true;
        }
        return false;
    }
    
    increaseQuantity(itemId) {
        //console.log('CartManager: increaseQuantity called for item:', itemId);
        //console.log('CartManager: Current cart items and their IDs:', this.cart.map(item => ({ id: item.id, name: item.name })));
        
        // Ensure itemId is an integer for comparison
        const targetId = parseInt(itemId);
        const itemIndex = this.cart.findIndex(item => parseInt(item.id) === targetId);
        
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += 1;
            //console.log('CartManager: Increased quantity to:', this.cart[itemIndex].quantity);
            this.saveCart();
            return true;
        }
        //console.log('CartManager: Item not found:', itemId, 'Target ID:', targetId);
        return false;
    }
    
    decreaseQuantity(itemId) {
        //console.log('CartManager: decreaseQuantity called for item:', itemId);
        //console.log('CartManager: Current cart items and their IDs:', this.cart.map(item => ({ id: item.id, name: item.name })));
        
        // Ensure itemId is an integer for comparison
        const targetId = parseInt(itemId);
        const itemIndex = this.cart.findIndex(item => parseInt(item.id) === targetId);
        
        if (itemIndex !== -1 && this.cart[itemIndex].quantity > 1) {
            this.cart[itemIndex].quantity -= 1;
            //console.log('CartManager: Decreased quantity to:', this.cart[itemIndex].quantity);
            this.saveCart();
            return true;
        }
        //console.log('CartManager: Cannot decrease - item not found or quantity is 1:', itemId, 'Target ID:', targetId, itemIndex !== -1 ? this.cart[itemIndex].quantity : 'not found');
        return false;
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
    }
    
    // Method to reset cart if there are ID issues
    resetCart() {
        //console.log('Resetting cart due to ID issues...');
        localStorage.removeItem(this.storageKey);
        this.cart = [];
        this.saveCart();
        // Dispatch event to notify UI
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { cart: this.cart } 
        }));
    }
    
    getActiveItems() {
        return this.cart.filter(item => item.quantity > 0);
    }
    
    getTotalItems() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    getTotalPrice() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    isEmpty() {
        return this.cart.length === 0 || this.cart.every(item => item.quantity <= 0);
    }
    
    // Debug method
    debugCart() {
        return;
        console.log('Current cart state:', {
            items: this.cart,
            totalItems: this.getTotalItems(),
            totalPrice: this.getTotalPrice(),
            activeItems: this.getActiveItems().length,
            isEmpty: this.isEmpty()
        });
    }
}

// Create global cart manager instance
if (typeof window !== 'undefined') {
    window.cartManager = new CartManager();
}
