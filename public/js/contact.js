/**
 * Contact Form Handler
 * 
 * This script handles the contact form submission using Firebase Functions
 * for server-side email processing with Nodemailer.
 * 
 * Current behavior:
 * - Validates form input on client side
 * - Sends data to Firebase Function (/sendContactEmail)
 * - Firebase Function sends email using Nodemailer
 * - Shows success/error feedback to user
 * 
 * Prerequisites:
 * 1. Firebase Functions deployed with sendContactEmail function
 * 2. Gmail credentials configured in functions/index.js
 * 3. GMAIL_USER and GMAIL_APP_PASSWORD environment variables set
 */

// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) {
        console.error('Contact form not found');
        return;
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !message) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;
        
        // Determine the correct endpoint based on environment
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const functionUrl = isLocalhost 
            ? 'http://127.0.0.1:5002/candleweb-1234/us-central1/sendContactEmail'  // Local emulator
            : '/sendContactEmail'; // Production with rewrite rule
        
        // Send to Firebase Function
        fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                message: message
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Success - show confirmation message
                showMessage(
                    `<div style="text-align: center;">
                        <div style="margin-bottom: 15px;">
                            <strong>Thank you for your message, ${name}!</strong>
                        </div>
                        <div style="margin-bottom: 15px;">
                            Your message has been sent successfully. We'll get back to you soon!
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            You can also reach us directly at:<br>
                            <a href="mailto:mariakazantzi@yahoo.com" style="color: #8B5A3C;">mariakazantzi@yahoo.com</a>
                        </div>
                    </div>`, 
                    'success'
                );
                
                // Hide the form fields
                const formGroups = this.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    group.style.display = 'none';
                });
                
                // Hide the send message button
                submitBtn.style.display = 'none';
                
                // Change the form title
                const formTitle = document.querySelector('.form-title');
                if (formTitle) {
                    formTitle.textContent = 'Sent Successfully';
                }
                
                // Reset the form (but keep it hidden)
                this.reset();
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            showMessage(
                `There was an error sending your message: ${error.message}. Please try again or contact us directly at mariakazantzi@yahoo.com`, 
                'error'
            );
        })
        .finally(() => {
            // Restore button state in case of error
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message function with styling
function showMessage(message, type) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = message;
    
    // Style the message
    messageDiv.style.cssText = `
        margin: 1rem 0;
        padding: 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        ${type === 'success' 
            ? 'background-color: #d1fae5; color: #065f46; border: 1px solid #34d399;' 
            : 'background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171;'
        }
    `;
    
    // Insert message before the form
    const form = document.querySelector('.contact-form');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Only auto-remove error messages, keep success messages permanent
    if (type === 'error') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    // Success messages stay permanently visible
}