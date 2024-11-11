// Fetch users to populate the dropdown
fetch('/api/reports/users')
    .then(response => response.json())
    .then(users => {
        const dropdown = document.getElementById('userDropdown');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.messagee;
            option.textContent = user.messagee;
            dropdown.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching users:', error);
    });

// Handle report submission
window.onload = () => {
    const selectedUser = document.getElementById('userDropdown').value;

    // Send report to the server automatically when the page loads
    fetch('/api/editPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reportedUser: selectedUser,
            reporter: userId,  // Assuming userId is available
        })
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message || 'Post updated successfully!');
        })
        .catch(error => {
            console.error('Error updating post:', error);
        });
};