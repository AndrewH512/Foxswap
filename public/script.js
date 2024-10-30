
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

const userList = document.getElementById('userList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

// Variable to store the selected recipient
let selectedRecipient = null;

console.log("Retrieved username:", username3);

// Send a message to the selected recipient
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message && selectedRecipient) {
        socket.emit('private message', { to: selectedRecipient, message }); // Send to the server
        messageInput.value = ''; // Clear input field
    } else if (!selectedRecipient) {
        alert("Please select a user to message.");
    }
});

// Listen for incoming private messages and display them
socket.on('private message', ({ from, message }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${from}: ${message}`;
    messagesDiv.appendChild(messageElement); // Append the message to the messages div
});

// Fetch chat history when a recipient is selected
function loadChatHistory(selectedRecipient) {
    fetch(`/chat-history/${username3}/${selectedRecipient}`)
        .then(response => response.json())
        .then(messages => {
            messagesDiv.innerHTML = ''; // Clear previous messages
            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `${msg.Sender}: ${msg.Message}`;
                messagesDiv.appendChild(messageElement);
            });
        })
        .catch(error => console.error('Error fetching chat history:', error));
}


const userSearch = document.getElementById('userSearch');
const searchResults = document.getElementById('searchResults');

userSearch.addEventListener('input', () => {
    const query = userSearch.value;
    if (query.length > 0) {
        fetch(`/search-user/${query}`)
            .then(response => response.json())
            .then(users => {
                searchResults.innerHTML = ''; // Clear previous results
                users.forEach(user => {
                    if (user !== username3) { // Exclude the current user
                        const userItem = document.createElement('div');
                        userItem.textContent = user;
                        userItem.classList.add('user-item');
                        userItem.addEventListener('click', () => {
                            selectedRecipient = user;
                            alert(`You are now messaging ${user}`);
                            loadChatHistory(selectedRecipient);
                            searchResults.innerHTML = ''; // Clear search results
                            userSearch.value = ''; // Clear search input

                            // Display the selected recipient's name at the top
                            document.getElementById('currentRecipient').textContent = `Messaging: ${selectedRecipient}`;
                        });
                        searchResults.appendChild(userItem);
                    }
                });
            })
            .catch(error => console.error('Error fetching users:', error));
    } else {
        searchResults.innerHTML = ''; // Clear results if query is empty
    }
});

// Listen for the custom event to update the chat list
socket.on('update user list', () => {
    loadChatUsers();
});


// Fetch the list of chat users that you have already messaged and display them
function loadChatUsers() {
    fetch(`/chat-users/${username3}`)
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            userList.innerHTML = ''; // Clear previous entries

            if (users.length === 0) {
                const noChatsMessage = document.createElement('div');
                noChatsMessage.textContent = "No chats yet. Start a conversation by searching for a user!";
                noChatsMessage.style.color = "#888";
                userList.appendChild(noChatsMessage);
            } else {
                users.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.textContent = user;

                    // Create delete button (X symbol)
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.style.marginLeft = '10px';
                    deleteButton.style.color = 'red';
                    deleteButton.onclick = () => deleteChat(user);

                    userItem.classList.add('user-item');
                    userItem.appendChild(deleteButton); // Append delete button to the user item
                    userItem.addEventListener('click', () => {
                        selectedRecipient = user;
                        document.getElementById('currentRecipient').textContent = `Messaging: ${selectedRecipient}`;
                        loadChatHistory(selectedRecipient);
                    });

                    userList.appendChild(userItem);
                });
            }
        })
        .catch(error => console.error('Error fetching chat users:', error));
}

function deleteChat(user) {
    if (confirm(`Are you sure you want to delete the chat with ${user}?`)) {
        fetch(`/delete-chat/${username3}/${user}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    loadChatUsers(); // Refresh the chat users list
                } else {
                    alert('Error deleting chat.');
                }
            })
            .catch(error => console.error('Error deleting chat:', error));
    }
}


// Call this function on page load
document.addEventListener('DOMContentLoaded', loadChatUsers);