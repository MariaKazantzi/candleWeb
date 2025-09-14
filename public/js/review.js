
// Review form functionality
let selectedRating = 0;

// Star rating system
document.addEventListener('DOMContentLoaded', function() {
    const starButtons = document.querySelectorAll('.star-btn');

    starButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStarDisplay();
        });

        button.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            highlightStars(hoverRating);
        });
    });

    document.getElementById('ratingStars').addEventListener('mouseleave', function() {
        updateStarDisplay();
    });

    function updateStarDisplay() {
        starButtons.forEach((button, index) => {
            if (index < selectedRating) {
                button.classList.remove('text-gray-300');
                button.classList.add('text-yellow-400');
            } else {
                button.classList.remove('text-yellow-400');
                button.classList.add('text-gray-300');
            }
        });
    }

    function highlightStars(rating) {
        starButtons.forEach((button, index) => {
            if (index < rating) {
                button.classList.remove('text-gray-300');
                button.classList.add('text-yellow-400');
            } else {
                button.classList.remove('text-yellow-400');
                button.classList.add('text-gray-300');
            }
        });
    }

    // Review form submission
    document.getElementById('reviewForm').addEventListener('submit', function(e) {
        e.preventDefault();

        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }

        const reviewText = document.getElementById('reviewText').value;
        if (!reviewText.trim()) {
            alert('Please write a review');
            return;
        }

        const formData = {
            rating: selectedRating,
            text: reviewText
        };

        // Here you would typically send the data to your server
        console.log('Review submitted:', formData);
        alert('Thank you for your review! It has been submitted.');

        // Reset form
        this.reset();
        selectedRating = 0;
        updateStarDisplay();
    });
});
