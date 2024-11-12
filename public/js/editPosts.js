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


};