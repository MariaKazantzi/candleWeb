// Product page specific functionality (non-cart related)

// Product data structure matching the HTML
const productsData = [
    {
        id: 1,
        name: 'Macaroon',
        category: 'Decorative Candles',
        description: 'Sweet and charming macaron-shaped candle',
        price: 2.95,
        image: 'pictures/candle1.png',
        link: 'products/product1.html',
        dateAdded: new Date('2025-09-13'), // Newest (current order)
        featured: true
    },
    {
        id: 2,
        name: 'Teddy Bear',
        category: 'Decorative Candles',
        description: 'Adorable teddy bear shaped candle',
        price: 2.95,
        image: 'pictures/candle2.png',
        link: 'products/product2.html',
        dateAdded: new Date('2025-09-12'),
        featured: true
    },
    {
        id: 3,
        name: 'Sea Shell',
        category: 'Ocean Collection',
        description: 'Beautiful seashell-inspired candle',
        price: 3.95,
        image: 'pictures/candle3.png',
        link: 'products/product3.html',
        dateAdded: new Date('2025-09-11'),
        featured: false
    },
    {
        id: 4,
        name: 'Small Bubble Cube',
        category: 'Geometric Collection',
        description: 'Modern geometric design with bubble texture',
        price: 2.95,
        image: 'pictures/candle4.png',
        link: 'products/product4.html',
        dateAdded: new Date('2025-09-10'),
        featured: false
    },
    {
        id: 5,
        name: 'Big Bubble Cube',
        category: 'Geometric Collection',
        description: 'Large geometric candle with bubble texture',
        price: 5.95,
        image: 'pictures/candle5.png',
        link: 'products/product5.html',
        dateAdded: new Date('2025-09-09'),
        featured: true
    },
    {
        id: 6,
        name: 'Big Heart Cube',
        category: 'Love Collection',
        description: 'Romantic heart-shaped candle cube',
        price: 5.95,
        image: 'pictures/candle6.png',
        link: 'products/product6.html',
        dateAdded: new Date('2025-09-08'),
        featured: false
    },
    {
        id: 7,
        name: 'Yin Yang',
        category: 'Zen Collection',
        description: 'Balanced harmony in candle form',
        price: 7.95,
        image: 'pictures/candle7.png',
        link: 'products/product7.html',
        dateAdded: new Date('2025-09-07'),
        featured: true
    },
    {
        id: 8,
        name: 'Mystery Box',
        category: 'Special Offers',
        description: 'Surprise collection of assorted candles',
        price: 15.95,
        originalPrice: 20.00,
        image: 'pictures/candle8.png',
        link: 'products/product8.html',
        dateAdded: new Date('2025-09-06'),
        featured: false,
        badge: 'Best Value'
    }
];

// Function to render products
function renderProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => {
        const priceHtml = product.originalPrice 
            ? `<span class="product-price">€${product.price.toFixed(2)}</span>
               <span class="product-price-original">€${product.originalPrice.toFixed(2)}</span>`
            : `<span class="product-price">€${product.price.toFixed(2)}</span>`;

        const badgeHtml = product.badge 
            ? `<div class="product-badge">${product.badge}</div>`
            : '';

        return `
            <a href="${product.link}" class="product-card group">
                <div class="product-card-inner">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name} Candle" class="product-image">
                        <div class="product-overlay">
                            <span class="view-details">View Details</span>
                        </div>
                        ${badgeHtml}
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h2 class="product-title">${product.name}</h2>
                        <p class="product-description">${product.description}</p>
                        <div class="product-pricing">
                            ${priceHtml}
                        </div>
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

// Sorting functions
function sortProducts(products, sortType) {
    const productsCopy = [...products];
    
    switch(sortType) {
        case 'featured':
            // Featured items first, then by original order
            return productsCopy.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.id - b.id;
            });
            
        case 'price-low':
            return productsCopy.sort((a, b) => a.price - b.price);
            
        case 'price-high':
            return productsCopy.sort((a, b) => b.price - a.price);
            
        case 'newest':
            // Keep the current order (newest to oldest based on dateAdded)
            return productsCopy.sort((a, b) => b.dateAdded - a.dateAdded);
            
        default:
            return productsCopy;
    }
}

// Handle sort dropdown change
function handleSortChange() {
    const sortDropdown = document.getElementById('sortDropdown');
    if (!sortDropdown) return;
    
    sortDropdown.addEventListener('change', function() {
        const sortType = this.value;
        const sortedProducts = sortProducts(productsData, sortType);
        renderProducts(sortedProducts);
    });
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

// Quantity adjustment function
function adjustQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    let currentValue = parseInt(quantityInput.value);
    let newValue = currentValue + change;
    
    if (newValue >= 1) {
        quantityInput.value = newValue;
    }
}

// Add to Cart functionality
function initializeAddToCart(productData) {
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (!addToCartBtn) return;
    
    addToCartBtn.addEventListener('click', function() {
        // Get product customization values based on product type
        const customization = getProductCustomization(productData);
        
        if (!customization.isValid) {
            alert(customization.errorMessage);
            return;
        }
        
        // Create the cart item
        const cartItem = {
            name: productData.name,
            price: productData.price,
            quantity: customization.quantity,
            image: productData.image,
            ...customization.data
        };
        
        // Add to cart using the cart manager
        if (window.cartManager) {
            const success = window.cartManager.addItem(cartItem);
            if (success) {
                // Show success message
                showAddToCartSuccess();
                
                // Reset form
                resetProductForm();
                
                // Force cart UI update and broadcast
                if (window.cartUI) {
                    window.cartUI.refresh();
                    window.cartUI.triggerPageSpecificUpdates();
                }
                
                // Dispatch custom event for immediate updates
                window.dispatchEvent(new CustomEvent('cartItemAdded', { 
                    detail: { product: cartItem, cart: window.cartManager.getCart() }
                }));
                
                console.log('Product added to cart successfully:', cartItem.name);
            } else {
                alert('Failed to add item to cart. Please try again.');
            }
        } else {
            alert('Cart system not available. Please refresh the page.');
        }
    });
}

// Get product customization based on current page/product
function getProductCustomization(productData) {
    const quantity = parseInt(document.getElementById('quantity')?.value || 1);
    
    if (!quantity || quantity < 1) {
        return {
            isValid: false,
            errorMessage: 'Please enter a valid quantity'
        };
    }
    
    // Handle different product types based on current page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('product1.html')) {
        // Macaroon candle
        const macaroonColour = document.getElementById('macaroonColour')?.value;
        const fillingColour = document.getElementById('fillingColour')?.value;
        const macaroonScent = document.getElementById('macaroonScent')?.value;
        
        if (!macaroonColour) {
            return { isValid: false, errorMessage: 'Please select a macaroon colour' };
        }
        if (!fillingColour) {
            return { isValid: false, errorMessage: 'Please select a filling colour' };
        }
        if (!macaroonScent) {
            return { isValid: false, errorMessage: 'Please select a scent' };
        }
        
        return {
            isValid: true,
            quantity: quantity,
            data: {
                color: `${macaroonColour} / ${fillingColour}`,
                scent: macaroonScent,
                customization: {
                    macaroonColour: macaroonColour,
                    fillingColour: fillingColour,
                    scent: macaroonScent
                }
            }
        };
    } else if (currentPath.includes('product2.html')) {
        // Teddy Bear candle
        const bearColor = document.getElementById('colour')?.value;
        const bearScent = document.getElementById('scent')?.value;
        
        if (!bearColor) {
            return { isValid: false, errorMessage: 'Please select a bear color' };
        }
        if (!bearScent) {
            return { isValid: false, errorMessage: 'Please select a scent' };
        }
        
        return {
            isValid: true,
            quantity: quantity,
            data: {
                color: bearColor,
                scent: bearScent,
                customization: {
                    bearColor: bearColor,
                    scent: bearScent
                }
            }
        };
    } else if (currentPath.includes('product3.html') || currentPath.includes('product4.html') || 
               currentPath.includes('product5.html') || currentPath.includes('product6.html')) {
        // Sea Shell, Bubble Cubes, Heart Cube candles
        const color = document.getElementById('colour')?.value;
        const scent = document.getElementById('scent')?.value;
        
        if (!color) {
            return { isValid: false, errorMessage: 'Please select a color' };
        }
        if (!scent) {
            return { isValid: false, errorMessage: 'Please select a scent' };
        }
        
        return {
            isValid: true,
            quantity: quantity,
            data: {
                color: color,
                scent: scent,
                customization: {
                    color: color,
                    scent: scent
                }
            }
        };
    } else if (currentPath.includes('product7.html')) {
        // Yin Yang candle - has two colors
        const colour1 = document.getElementById('colour1')?.value;
        const colour2 = document.getElementById('colour2')?.value;
        const scent = document.getElementById('scent')?.value;
        
        if (!colour1) {
            return { isValid: false, errorMessage: 'Please select the first colour' };
        }
        if (!colour2) {
            return { isValid: false, errorMessage: 'Please select the second colour' };
        }
        if (!scent) {
            return { isValid: false, errorMessage: 'Please select a scent' };
        }
        
        return {
            isValid: true,
            quantity: quantity,
            data: {
                color: `${colour1} / ${colour2}`,
                scent: scent,
                customization: {
                    colour1: colour1,
                    colour2: colour2,
                    scent: scent
                }
            }
        };
    } else {
        // Generic product (no customization)
        return {
            isValid: true,
            quantity: quantity,
            data: {
                color: 'Default',
                scent: 'Unscented'
            }
        };
    }
}

// Reset product form after adding to cart
function resetProductForm() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('product1.html')) {
        // Reset macaroon form
        const macaroonColour = document.getElementById('macaroonColour');
        const fillingColour = document.getElementById('fillingColour');
        const macaroonScent = document.getElementById('macaroonScent');
        const quantity = document.getElementById('quantity');
        
        if (macaroonColour) macaroonColour.value = '';
        if (fillingColour) fillingColour.value = '';
        if (macaroonScent) macaroonScent.value = '';
        if (quantity) quantity.value = '1';
    } else if (currentPath.includes('product2.html')) {
        // Reset teddy bear form
        const bearColor = document.getElementById('colour');
        const bearScent = document.getElementById('scent');
        const quantity = document.getElementById('quantity');
        
        if (bearColor) bearColor.value = '';
        if (bearScent) bearScent.value = '';
        if (quantity) quantity.value = '1';
    } else if (currentPath.includes('product3.html') || currentPath.includes('product4.html') || 
               currentPath.includes('product5.html') || currentPath.includes('product6.html')) {
        // Reset color and scent form for products 3-6
        const color = document.getElementById('colour');
        const scent = document.getElementById('scent');
        const quantity = document.getElementById('quantity');
        
        if (color) color.value = '';
        if (scent) scent.value = '';
        if (quantity) quantity.value = '1';
    } else if (currentPath.includes('product7.html')) {
        // Reset Yin Yang form with two colors
        const colour1 = document.getElementById('colour1');
        const colour2 = document.getElementById('colour2');
        const scent = document.getElementById('scent');
        const quantity = document.getElementById('quantity');
        
        if (colour1) colour1.value = '';
        if (colour2) colour2.value = '';
        if (scent) scent.value = '';
        if (quantity) quantity.value = '1';
    } else {
        // Reset generic form
        const quantity = document.getElementById('quantity');
        if (quantity) quantity.value = '1';
    }
}

// Show success message when item is added to cart
function showAddToCartSuccess() {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Added to cart successfully!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Get current product data based on page
function getCurrentProductData() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('product1.html')) {
        return productsData.find(p => p.id === 1);
    } else if (currentPath.includes('product2.html')) {
        return productsData.find(p => p.id === 2);
    } else if (currentPath.includes('product3.html')) {
        return productsData.find(p => p.id === 3);
    } else if (currentPath.includes('product4.html')) {
        return productsData.find(p => p.id === 4);
    } else if (currentPath.includes('product5.html')) {
        return productsData.find(p => p.id === 5);
    } else if (currentPath.includes('product6.html')) {
        return productsData.find(p => p.id === 6);
    } else if (currentPath.includes('product7.html')) {
        return productsData.find(p => p.id === 7);
    } else if (currentPath.includes('product8.html')) {
        return productsData.find(p => p.id === 8);
    }
    
    return null;
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Products page loaded');
    
    // Only initialize sorting on shop page
    if (window.location.pathname.includes('shop.html') || window.location.pathname.endsWith('/')) {
        // Initialize with default "newest" order (current order)
        const sortedProducts = sortProducts(productsData, 'newest');
        renderProducts(sortedProducts);
        
        // Set up sort dropdown handler
        handleSortChange();
        
        console.log('Shop page sorting initialized');
    }
    
    // Initialize Add to Cart functionality on product pages
    if (window.location.pathname.includes('product')) {
        const currentProduct = getCurrentProductData();
        if (currentProduct) {
            initializeAddToCart(currentProduct);
            console.log('Add to Cart initialized for:', currentProduct.name);
        }
    }
});
