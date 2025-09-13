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
});
