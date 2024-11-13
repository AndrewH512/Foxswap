// Fetch users to populate the dropdown
fetch('/api/reports/users')
    .then(response => response.json())
    .then(users => {
        const dropdown = document.getElementById('buyerSection').querySelector('select'); // Get the <select> element inside the buyerSection div
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
    const selectedUser = document.getElementById('buyerSection').querySelector('select').value; // Get the selected value from the <select> element
    console.log("Selected user: ", selectedUser);
};
