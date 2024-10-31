// Get the current URL
const url2 = window.location.href;

// Create a URLSearchParams object to parse the query string
const params2 = new URLSearchParams(window.location.search);

// Get the value of the 'username' parameter
const username3 = params2.get('username');

// Connect to the server
const socket = io();

// When a user connects, register their username with the server
socket.emit('register', username3);

// Get DOM elements for user list, message form, message input, and messages display area
const userList = document.getElementById('userList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

// Get the search input and search results elements from the DOM
const userSearch = document.getElementById('userSearch');
const searchResults = document.getElementById('searchResults');

// Variable to store the selected recipient
let selectedRecipient = null;
// Log the retrieved username
console.log("Retrieved username:", username3);

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
    } else if (!selectedRecipient) {
        alert("Please select a user to message.");
    }
});

// Listen for incoming private messages and display them
socket.on('private message', ({ from, message }) => {
    // Create a new div for the message
    const messageElement = document.createElement('div');
    // Set the message text
    messageElement.textContent = `${from}: ${message}`;
    // Append the message to the messages div
    messagesDiv.appendChild(messageElement); 
});

// Fetch chat history when a recipient is selected
function loadChatHistory(selectedRecipient) {
    // Fetch chat history for the selected recipient
    fetch(`/chat-history/${username3}/${selectedRecipient}`)
        .then(response => response.json())
        .then(messages => {
            // Clear previous messages in the display area
            messagesDiv.innerHTML = ''; 
            messages.forEach(msg => {
                // Create a div for each message
                const messageElement = document.createElement('div');
                // Set message text
                messageElement.textContent = `${msg.Sender}: ${msg.Message}`;
                // Append message to the messages div
                messagesDiv.appendChild(messageElement);
            });

            // Mark messages as read by sending a POST request
            fetch(`/mark-as-read/${username3}/${selectedRecipient}`, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        // Log error if marking as read fails
                        console.error('Error marking messages as read');
                    }
                });
        })
        .catch(error => console.error('Error fetching chat history:', error));
}

// Listen for input in the user search field to fetch users matching the query
userSearch.addEventListener('input', () => {
    // Get the current input value
    const query = userSearch.value;
    if (query.length > 0) {
        fetch(`/search-user/${query}`)
            .then(response => response.json())
            .then(users => {
                // Clear previous results
                searchResults.innerHTML = ''; 
                users.forEach(user => {
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
             // Log any fetch errors
            .catch(error => console.error('Error fetching users:', error));
    } else {
        // Clear results if query is empty
        searchResults.innerHTML = ''; 
    }
});

// Listen for the custom event to update the chat list
socket.on('update user list', () => {
    loadChatUsers();
});

// Fetch the list of chat users that you have already messaged and display them
function loadChatUsers() {
    // Fetch chat users from the server
    fetch(`/chat-users/${username3}`)
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            // Clear previous entries
            userList.innerHTML = ''; 

            if (users.length === 0) {
                // Create a message for no chats
                const noChatsMessage = document.createElement('div');
                noChatsMessage.textContent = "No chats yet. Start a conversation by searching for a user!";
                // Style for the no chats message
                noChatsMessage.style.color = "#888";
                // Append the message to the user list
                userList.appendChild(noChatsMessage);
            } else {
                users.forEach(user => {
                    // Create a div for each user
                    const userItem = document.createElement('div');
                    userItem.textContent = user; // Set the text to the username
                
                    // Create delete button (X symbol)
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.style.marginLeft = '10px';
                    deleteButton.style.color = 'red';
                    deleteButton.onclick = () => {
                        deleteChat(user); // Call the function to delete the chat data from the backend
                    };
                
                    userItem.classList.add('user-item'); // Add a class for styling
                    userItem.appendChild(deleteButton); // Append delete button to the user item
                
                    // Set up click event to select a chat with the user
                    userItem.addEventListener('click', () => {
                        selectedRecipient = user;
                        document.getElementById('currentRecipient').textContent = `Messaging: ${selectedRecipient}`;
                        loadChatHistory(selectedRecipient); // Load chat history when user is clicked
                    });
                
                    userList.appendChild(userItem); // Append the user item to the user list
                });
            }
        })
        .catch(error => console.error('Error fetching chat users:', error));
}

// Function to delete a chat with a specified user
function deleteChat(user) {
    if (confirm(`Are you sure you want to delete the chat with ${user}?`)) {
        fetch(`/delete-chat/${username3}/${user}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    // Remove the user from the UI without reloading the entire list
                    const userList = document.getElementById('userList');
                    const userItem = Array.from(userList.children).find(
                        item => item.textContent.includes(user)
                    );
                    if (userItem) {
                        userList.removeChild(userItem);
                    }

                    // Clear the selected chat messages if the deleted user is currently selected
                    if (selectedRecipient === user) {
                        messagesDiv.innerHTML = '';
                        document.getElementById('currentRecipient').textContent = '';
                    }
                } else {
                    alert('Error deleting chat.');
                }
            })
            .catch(error => console.error('Error deleting chat:', error));
    }
}

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

// Call this function on page load
document.addEventListener('DOMContentLoaded', loadChatUsers);

// Function to show a notification
function showNotification(message) {
    const notificationDiv = document.getElementById('globalNotification');
    notificationDiv.textContent = message;
    notificationDiv.style.display = 'block';
    notificationDiv.style.color = 'red'; // Optional styling
    notificationDiv.style.background = 'white'; // Background color
    notificationDiv.style.border = '1px solid red'; // Border styling
    notificationDiv.style.padding = '5px'; // Padding for aesthetics

    // Remove the notification after a few seconds
    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 5000);
}

// Listen for notification of unread messages
socket.on('notification', ({ count }) => {
    showNotification(`You have ${count} unread message(s)`);
});