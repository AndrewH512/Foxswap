function toggleFooterVisibility() {
    const footer = document.querySelector("footer");
    // Check if the user is at the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      footer.style.display = "block"; // Show the footer
    } else {
      footer.style.display = "none"; // Hide the footer
    }
  }

// Call toggleFooterVisibility immediately to set initial visibility
toggleFooterVisibility();

// Automatically call checkSession when the page loads
document.addEventListener('DOMContentLoaded', toggleFooterVisibility);

// Listen for scroll events
window.addEventListener("scroll", toggleFooterVisibility);

