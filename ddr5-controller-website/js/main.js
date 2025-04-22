document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const toggleButton = document.getElementById('theme-toggle');
    const html = document.documentElement;

    toggleButton.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });

    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
        html.classList.add('dark');
    }

    // Fade-in animation
    document.body.classList.add('fade-in');
    
    // Style animation buttons
    const customButtons = document.querySelectorAll('.custom-btn');
    customButtons.forEach(button => {
        if (button.id.includes('play')) {
            button.style.backgroundColor = '#4CAF50'; // Green
        } else if (button.id.includes('pause')) {
            button.style.backgroundColor = '#FF9800'; // Orange
        } else if (button.id.includes('reset')) {
            button.style.backgroundColor = '#f44336'; // Red
        } else if (button.id.includes('write')) {
            button.style.backgroundColor = '#2196F3'; // Blue
        } else if (button.id.includes('read')) {
            button.style.backgroundColor = '#9C27B0'; // Purple
        } else {
            button.style.backgroundColor = '#607D8B'; // Blue-gray
        }
    });
    
    // Log info about animations
    console.log('Main.js loaded, animation buttons styled');
});