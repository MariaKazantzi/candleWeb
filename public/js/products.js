// Product page specific functionality (non-cart related)

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
    
    // Any product-specific initialization can go here
    // Cart functionality is now handled by cart-ui.js
});
