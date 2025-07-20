// Shopping cart functionality and product page interactions

// Shopping cart data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">€${(item.price * item.quantity).toFixed(2)}</div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">×</button>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: €${total.toFixed(2)}`;
}

// Add to cart function
function addToCart() {
    const color = document.getElementById('color').value;
    const scent = document.getElementById('scent').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    
    const product = {
        id: Date.now(), // Simple ID generation
        name: 'Sexy Lavender',
        price: 4,
        color: color,
        scent: scent,
        quantity: quantity
    };
    
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Show success message
    alert('Product added to cart!');
}

// Remove from cart function
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Toggle cart dropdown
function toggleCart() {
    const dropdown = document.getElementById('cartDropdown');
    dropdown.classList.toggle('hidden');
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
