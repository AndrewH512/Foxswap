// Function to check if the user is authenticated
function checkSession() {
    fetch('/api/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const params = new URLSearchParams(window.location.search);
            const urlUsername = params.get('username'); // Get the username from the URL

            // Check if the user is authenticated
            if (!data.authenticated) {
                // If not authenticated, redirect to login page
                window.location.href = '/login.html';
            } else {
                // Check if the username from the URL matches the authenticated user's username
                if (data.username !== urlUsername) {
                    // If the usernames don't match, redirect to login page
                    window.location.href = '/login.html';
                    alert("You have been logged out, Please Log Back In")
                } else {
                    // Proceed based on admin status
                    if (data.admin) {
                        updateNavBarForAdmin();
                    } else {
                        updateNavBarForUser();
                    }
                }
            }
        })
        .catch(error => {
            console.error("Error checking session:", error);
        });
}

// Function to update navbar for admin users
function updateNavBarForAdmin() {
    const nav = document.querySelector('nav');
    const username = new URLSearchParams(window.location.search).get('username'); // Get username from URL
    nav.innerHTML = `
        <a href="homepage.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-home"></i>Homepage</a>
        <a href="browse.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-search"></i>Browse</a>
        <a href="messages.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-comments"></i>Messages</a>
        <a href="myprofile.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-user"></i>My Profile</a>
        <a href="favorites.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-heart"></i>Favorites</a>
        <a href="post.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-plus-circle"></i>Post</a>
        <a href="yourposts.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-file-alt"></i>Your Posts</a>
        <a href="admin_home.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-cog"></i>Admin Panel</a>
        <a href="adminReports.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-chart-line"></i>Admin Reports</a>
        <a href="/public/logout${username ? '?username=' + encodeURIComponent(username) : ''}" id="logoutButton"><i class="fas fa-sign-out-alt"></i>Logout</a>
    `;
}

// Function to update navbar for non-admin users
function updateNavBarForUser() {
    const nav = document.querySelector('nav');
    const username = new URLSearchParams(window.location.search).get('username'); // Get username from URL
    nav.innerHTML = `
        <a href="homepage.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-home"></i>Homepage</a>
        <a href="browse.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-search"></i>Browse</a>
        <a href="messages.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-comments"></i>Messages</a>
        <a href="myprofile.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-user"></i>My Profile</a>
        <a href="favorites.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-heart"></i>Favorites</a>
        <a href="post.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-plus-circle"></i>Post</a>
        <a href="yourposts.html${username ? '?username=' + encodeURIComponent(username) : ''}"><i class="fas fa-file-alt"></i>Your Posts</a>
        <a href="/public/logout${username ? '?username=' + encodeURIComponent(username) : ''}" id="logoutButton"><i class="fas fa-sign-out-alt"></i>Logout</a>
    `;
}

// Automatically call checkSession when the page loads
document.addEventListener('DOMContentLoaded', checkSession);

// Start of the Appendusers.js
document.addEventListener('DOMContentLoaded', () => {
    const url = window.location.href;
    const params = new URLSearchParams(window.location.search);
    const username2 = params.get('username');

    console.log("username: " + username2);

    if (username2) {
        document.querySelectorAll('a').forEach(link => {
            const linkUrl = new URL(link.href);
            linkUrl.searchParams.set('username', username2);
            link.href = linkUrl.toString();
        });
    }
});