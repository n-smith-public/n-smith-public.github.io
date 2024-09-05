function toggleDesign() {
    let currentURL = window.location.href;
    
    if (currentURL.includes('index-comedy Old.html')) {
        // Switch to new design
        window.location.href = 'index-comedy.html';
    } else {
        // Switch to old design
        window.location.href = 'index-comedy Old.html';
    }
}

// Update the icon based on the current page
function updateIcon() {
    let currentURL = window.location.href;
    let icon = document.getElementById('designIcon');
    
    // If we are on the old design page, show the moon icon
    if (currentURL.includes('index-comedy Old.html')) {
        icon.textContent = '🌙'; // Moon icon for old design
    } else {
        icon.textContent = '🌞'; // Sun icon for new design
    }
}

// Run updateIcon when the page loads
document.addEventListener('DOMContentLoaded', updateIcon);