// Admin Status JS File
// This allows an Admin to search for a user
// then can either make them an Admin or remove them as an Admin
// Search functionality
document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search-query').value;

    if (!query) {
      alert('Please enter a username or email to search for.');
      return;
    }

    // Perform search query API request
    fetch(`/api/search-users?query=${query}`)
      .then(response => response.json())
      .then(data => {
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Clear any previous results
        if (data.length > 0) {
          data.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = `${user.Username} (${user.Email})`;
            const button = document.createElement('button');
            button.textContent = 'Select';
            button.addEventListener('click', function() {
              document.getElementById('selected-username').value = user.Username;
              document.getElementById('search-results').style.display = 'none';
              document.getElementById('change-admin-status').style.display = 'block';
            });
            listItem.appendChild(button);
            userList.appendChild(listItem);
          });
          document.getElementById('search-results').style.display = 'block';
        } else {
          userList.innerHTML = '<li>No users found</li>';
          document.getElementById('search-results').style.display = 'block';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error searching for users.');
      });
  });

  // Admin status change functionality
  document.getElementById('admin-status-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('selected-username').value;
    const isAdmin = document.getElementById('isAdmin').value === 'true'; // Get the value of admin status

    // Send the PUT request to change the admin status
    fetch(`/api/change-admin-status/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isAdmin }), // Send the admin status in the body
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('response-message').innerText = data.message || 'Admin status updated successfully.';
    })
    .catch(error => {
      document.getElementById('response-message').innerText = 'Error updating admin status.';
      console.error('Error:', error);
    });
  });