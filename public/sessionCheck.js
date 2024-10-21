// Function to check if the user is authenticated
function checkSession() {
    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                // If not authenticated, redirect to login page
                window.location.href = '/login.html';
            } else {
                // Populate the page with user data, e.g., welcome message
                const username = data.username;
                const welcomeMessageElement = document.getElementById('welcomeMessage');
                if (welcomeMessageElement) {
                    welcomeMessageElement.textContent = `Welcome, ${username}`;
                }
            }
        })
        .catch(error => {
            console.error("Error checking session:", error);
        });
}

// Automatically call checkSession when the page loads
document.addEventListener('DOMContentLoaded', checkSession);