// Contact Form Integration & UI Handling
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const notification = document.getElementById('form-notification');

    if (!contactForm) return;

    // Helper to display messages in the inline alert
    const showNotification = (message, type) => {
        if (!notification) return;

        notification.textContent = message;
        notification.className = `form-notification ${type}`;
        notification.style.display = 'block';

        // Auto scroll to notification if not in view
        notification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const hideNotification = () => {
        if (!notification) return;
        notification.style.display = 'none';
        notification.className = 'form-notification';
        notification.textContent = '';
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideNotification();

        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn ? submitBtn.textContent : 'Send Project Inquiry';

        // Gather form fields
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const company = document.getElementById('company').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject').value;
        const urgency = document.getElementById('urgency').value;
        const budget = document.getElementById('budget').value;
        const timeline = document.getElementById('timeline').value;
        const message = document.getElementById('message').value.trim();

        // Validation
        if (!fullName || !email || !subject || !message) {
            showNotification('Please fill in all required fields marked with an asterisk (*).', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showNotification('Please provide a valid email address.', 'error');
            return;
        }

        // Set Loading state
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    company,
                    phone,
                    subject,
                    urgency,
                    budget,
                    timeline,
                    message
                })
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            let data = {};
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error(`API endpoint not found (${response.status}). If running locally, make sure to use Vercel CLI ('vercel dev') instead of a simple static file server.`);
            }

            if (response.ok && data.success) {
                showNotification(data.message || 'Thank you! Your message was sent successfully.', 'success');
                contactForm.reset();
            } else {
                throw new Error(data.error || 'Failed to dispatch email.');
            }

        } catch (error) {
            console.error('Contact Form Error:', error);
            showNotification(error.message || 'Oops! Something went wrong. Please try again later or email me directly.', 'error');
        } finally {
            // Restore button state
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });

    // Helper to validate email structure
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});