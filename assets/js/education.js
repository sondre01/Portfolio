document.addEventListener('DOMContentLoaded', () => {
    // This script handles the click functionality for the expandable education cards.
    const toggleButtons = document.querySelectorAll('.dropdown-toggle');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            if (targetContent) {
                // Toggle the 'active' class to expand/collapse the content
                targetContent.classList.toggle('active');
            }
        });
    });
});