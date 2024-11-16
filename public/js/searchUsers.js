function searchUsers() {
    const query = document.getElementById('searchInput').value;
    fetch(`/api/search-users?query=${query}`)
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';
            const limitedUsers = users.slice(0, 5);  // Limit to 5 results
            limitedUsers.forEach(user => {
                const userElement = document.createElement('div');
                userElement.innerHTML = `
                    <p>${user.Username} (${user.Email}) 
                    ${user.Banned ? "<span style='color:red;'>Banned</span>" : ""}
                    ${user.Banned ? 
                        `<button onclick="unbanUser('${user.Username}')">Unban</button>` : 
                        `<button onclick="banUser('${user.Username}')">Ban</button>`
                    }</p>
                `;
                userList.appendChild(userElement);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function banUser(username) {
    fetch(`/api/ban-user/${username}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('User banned successfully');
                searchUsers();  // Re-run search to refresh the list
            } else {
                alert('Failed to ban user');
            }
        })
        .catch(error => console.error('Error banning user:', error));
}

function unbanUser(username) {
    fetch(`/api/unban-user/${username}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('User unbanned successfully');
                searchUsers();  // Re-run search to refresh the list
            } else {
                alert('Failed to unban user');
            }
        })
        .catch(error => console.error('Error unbanning user:', error));
}