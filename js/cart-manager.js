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
            console.log('Cart loaded from localStorage:', cart);
            return cart;
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    }
    
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            console.log('Cart saved to localStorage:', this.cart);
            
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
                id: Date.now() + Math.random(), // More unique ID
                ...item
            };
            this.cart.push(newItem);
        }
        
        this.saveCart();
        return true;
    }
    
    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
    }
    
    updateQuantity(itemId, newQuantity) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            if (newQuantity <= 0) {
                this.cart[itemIndex].quantity = 0;
            } else {
                this.cart[itemIndex].quantity = newQuantity;
            }
            this.saveCart();
            return true;
        }
        return false;
    }
    
    increaseQuantity(itemId) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += 1;
            this.saveCart();
            return true;
        }
        return false;
    }
    
    decreaseQuantity(itemId) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex !== -1 && this.cart[itemIndex].quantity > 0) {
            this.cart[itemIndex].quantity -= 1;
            this.saveCart();
            return true;
        }
        return false;
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
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
        return this.cart.length === 0 || this.cart.every(item => item.quantity === 0);
    }
    
    // Debug method
    debugCart() {
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
