// Get the current URL and username parameter
const url2 = window.location.href;
const params2 = new URLSearchParams(window.location.search);
const username3 = params2.get('username');

// Connect to the server register their username
const socket = io("http://foxswap.shop/");
socket.emit('register', username3);

// Get DOM elements for user list, message form, message input, messages display aream and search
const userList = document.getElementById('userList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');
const userSearch = document.getElementById('userSearch');
const searchResults = document.getElementById('searchResults');
let selectedRecipient = null;

// Apply red borders to relevant elements
userList.style.border = '2px solid red';
messagesDiv.style.border = '2px solid red';

// Call this function on page load
document.addEventListener('DOMContentLoaded', loadChatUsers);

// Send a message to the selected recipient
messageForm.addEventListener('submit', (e) => {
    // Prevent default form submission
    e.preventDefault();
    // Get the message input value
    const message = messageInput.value;
    if (message && selectedRecipient) {
        // Emit the private message to the server
        socket.emit('private message', { to: selectedRecipient, message });
        // Clear the input field after sending
        messageInput.value = '';
        // Check if the selected recipient is in the removed users list
        if (removedUsers.includes(selectedRecipient)) {
            // If yes, remove them from the removed users list
            removedUsers = removedUsers.filter(user => user !== selectedRecipient);
            saveRemovedUsers(); // Save updated removed users to local storage
            loadChatUsers(); // Refresh the chat users list to show the added user
        }

    } else if (!selectedRecipient) {
        alert("Please select a user to message.");
    }
});

// Listen for incoming private messages and display them
socket.on('private message', ({ from, message }) => {
    // Check if the message is from the selected recipient or it's the message you sent
    if (from === selectedRecipient || from === username3) {
        // Create a new div for the message
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', from === username3 ? 'sent' : 'received'); // Add appropriate class

        // Set the message text with username
        messageElement.innerHTML = `
            <span class="username">${from}</span>
            ${message}
        `;

        // Append the message to the messages div
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
    } else {
        // If the message is from another user, show a notification
        loadChatUsers();
        showNotification(`New message from ${from}`);
    }
});

// Fetch chat history when a recipient is selected
function loadChatHistory(selectedRecipient) {
    fetch(`/chat-history/${username3}/${selectedRecipient}`)
        .then(response => response.json())
        .then(messages => {
            // Clear previous messages in the display area
            messagesDiv.innerHTML = '';
            messages.forEach(msg => {
                // Create a div for each message
                const messageElement = document.createElement('div');
                // Apply the CSS class based on the sender
                messageElement.classList.add('message', msg.Sender === username3 ? 'sent' : 'received');

                // Set the message text with username
                messageElement.innerHTML = `
                    <span class="username">${msg.Sender}</span>
                    ${msg.Message}
                `;

                // Append message to the messages div
                messagesDiv.appendChild(messageElement);
            });

            // Scroll to the bottom of the chat history
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // Mark messages as read by sending a POST request
            fetch(`/mark-as-read/${username3}/${selectedRecipient}`, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        console.error('Error marking messages as read');
                    }
                });
        })
        .catch(error => console.error('Error fetching chat history:', error));
}

// Listen for the custom event to update the chat list
socket.on('update user list', () => {
    loadChatUsers();
});

// Function to load chat users
function loadChatUsers() {
    // Fetch chat users from the server
    fetch(`/chat-users/${username3}`)
        .then(response => response.json())
        .then(users => {
            console.log("Fetched users:", users); // Log the users fetched from the server
            const userList = document.getElementById('userList');
            // Clear previous entries
            userList.innerHTML = '';

            // Filter out removed users
            const filteredUsers = users.filter(user => !removedUsers.includes(user));
            console.log("Filtered users:", filteredUsers); // Log the filtered users
            console.log("Removed users:", removedUsers); // Log the removed users

            if (filteredUsers.length === 0) {
                // Create a message for no chats
                const noChatsMessage = document.createElement('div');
                noChatsMessage.textContent = "No chats yet. Start a conversation by searching for a user!";
                noChatsMessage.style.color = "#888";
                userList.appendChild(noChatsMessage);
            } else {
                filteredUsers.forEach(user => {
                    // Create a div for each user
                    const userItem = document.createElement('div');
                    userItem.textContent = user;

                    // Create view profile button
                    const viewProfileButton = document.createElement('button');
                    viewProfileButton.textContent = 'View Profile';
                    viewProfileButton.style.marginLeft = 'auto'; /* Pushes button to the right */
                    viewProfileButton.style.color = 'white';
                    viewProfileButton.style.border = '2px solid white'; 
                    viewProfileButton.style.backgroundColor = 'transparent';
                    viewProfileButton.style.padding = '5px 10px'; 
                    viewProfileButton.style.cursor = 'pointer';
                    viewProfileButton.style.whiteSpace = 'nowrap';
                    viewProfileButton.onclick = () => {
                        window.location.href = `viewProfile.html?username=${encodeURIComponent(username3)}&seller=${encodeURIComponent(user)}`;
                    };

                    // Create delete button (X symbol)
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.style.color = 'red';
                    deleteButton.style.fontSize = '20px';
                    deleteButton.style.marginLeft = '10px';
                    deleteButton.onclick = () => deleteChat(user);

                    userItem.classList.add('user-item');
                    userItem.appendChild(viewProfileButton); // Append view profile button
                    userItem.appendChild(deleteButton); // Append delete button to the user item
                    userItem.addEventListener('click', () => {
                        selectedRecipient = user; // Set the selected recipient
                        document.getElementById('currentRecipient').textContent = `Messaging: ${selectedRecipient}`;
                        loadChatHistory(selectedRecipient); // Load chat history when the user is clicked
                    });

                    userList.appendChild(userItem);
                });
            }
        })
        .catch(error => console.error('Error fetching chat users:', error));
}

// Listen for input in the user search field to fetch users matching the query
userSearch.addEventListener('input', () => {
    // Get the current input value
    const query = userSearch.value;

    // Clear any existing search results title before starting a new search
    const searchTitle = document.getElementById('searchTitle');
    if (searchTitle) {
        searchTitle.remove();
    }

    if (query.length > 0) {
        fetch(`/search-user/${query}`)
            .then(response => response.json())
            .then(users => {
                // Clear previous results
                searchResults.innerHTML = '';

                // Display "Search Results" text if users are found
                if (users.length > 0) {
                    const title = document.createElement('h3');
                    title.id = 'searchTitle';
                    title.textContent = 'Search Results';
                    title.style.color = 'white';
                    searchResults.prepend(title);
                }

                // Limit the users to a maximum of 4
                users.slice(0, 4).forEach(user => {
                    // Exclude the current user
                    if (user !== username3) {
                        const userItem = document.createElement('div');
                        userItem.textContent = user;
                        userItem.classList.add('user-item');
                        userItem.addEventListener('click', () => {
                            selectedRecipient = user;
                            alert(`You are now messaging ${user}`);
                            loadChatHistory(selectedRecipient);
                            // Clear search results
                            searchResults.innerHTML = '';
                            // Clear search input
                            userSearch.value = '';

                            // Display the selected recipient's name at the top
                            document.getElementById('currentRecipient').textContent = `Messaging: ${selectedRecipient}`;
                        });
                        // Append the user item to search results
                        searchResults.appendChild(userItem);
                    }
                });
            })
            .catch(error => console.error('Error fetching users:', error));
    } else {
        // Clear results if query is empty
        searchResults.innerHTML = '';
    }
});

// Function to delete a chat with a specified user
function deleteChat(user) {
    if (confirm(`Are you sure you want to remove ${user} from your chat list?`)) {
        // Add the user to the removed users list if not already present
        if (!removedUsers.includes(user)) {
            removedUsers.push(user);
            saveRemovedUsers(); // Save updated removed users to local storage
        }

        // Clear the selected chat messages if the deleted user is currently selected
        if (selectedRecipient === user) {
            // Clear the messages display area
            messagesDiv.innerHTML = '';
            // Reset selectedRecipient to null
            selectedRecipient = null;
            document.getElementById('currentRecipient').textContent = ''; // Clear recipient display
        }

        // Refresh the chat users list without this user
        loadChatUsers();

        // Reload the page to reflect the changes
        location.reload(); // Reload the page to reflect the changes
    }
}

// Function to load removed users from local storage
function getRemovedUsers() {
    const removed = localStorage.getItem('removedUsers');
    return removed ? JSON.parse(removed) : [];
}

// Function to save removed users to local storage
function saveRemovedUsers() {
    localStorage.setItem('removedUsers', JSON.stringify(removedUsers));
}

// Array to track removed users
let removedUsers = getRemovedUsers();

// Listen for notification of unread messages
socket.on('notification', ({ count }) => {
    const notificationDiv = document.createElement('div');
    notificationDiv.textContent = `You have ${count} unread message(s)`;
    notificationDiv.style.color = 'red'; // Optional styling
    notificationDiv.style.position = 'fixed'; // Fixed position on the screen
    notificationDiv.style.top = '10px';
    notificationDiv.style.right = '10px';
    notificationDiv.style.zIndex = '1000';
    notificationDiv.style.background = 'white'; // Background color
    notificationDiv.style.border = '1px solid red'; // Border styling
    notificationDiv.style.padding = '5px'; // Padding for aesthetics
    document.body.appendChild(notificationDiv);

    // Remove the notification after a few seconds
    setTimeout(() => {
        notificationDiv.remove();
    }, 5000);
});

// Listen for notification of unread messages
socket.on('notification', ({ count }) => {
    showNotification(`You have ${count} unread message(s)`);
});

// Function to show a notification
function showNotification(message) {
    const notificationDiv = document.createElement('div');
    notificationDiv.textContent = message;
    notificationDiv.style.color = 'red'; // Optional styling
    notificationDiv.style.position = 'fixed'; // Fixed position on the screen
    notificationDiv.style.top = '10px';
    notificationDiv.style.right = '10px';
    notificationDiv.style.zIndex = '1000';
    notificationDiv.style.background = 'white'; // Background color
    notificationDiv.style.border = '1px solid red'; // Border styling
    notificationDiv.style.padding = '5px'; // Padding for aesthetics
    document.body.appendChild(notificationDiv);

    // Remove the notification after a few seconds
    setTimeout(() => {
        notificationDiv.remove();
    }, 5000);
}

// Get the value of the 'chatWith' parameter from the URL
const chatWith = params2.get('recipient'); // This should match the key used in the URL

if (chatWith) {
    if (chatWith != username3) {
        console.log('here');
        // Set the selected recipient
        selectedRecipient = chatWith;

        // Load chat history with the seller
        loadChatHistory(selectedRecipient);

        // Display the selected recipient's name at the top
        document.getElementById('currentRecipient').textContent = `Messaging: ${selectedRecipient}`;

        // Inform the user
        alert(`You are now messaging ${chatWith}`);
    } else {
        console.log('the same user redirect!!!')
        // Inform the user
        alert(`You can't message ${chatWith} because thats you!`);
    }
}