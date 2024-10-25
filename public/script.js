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

// Listen for the user list from the server and display it
socket.on('user list', (users) => {
    // Clear the existing list
    userList.innerHTML = '';
    
    // Create a list item for each user
    users.forEach((user) => {
        console.log(user)
        if (user !== username3) { // Don't display the current user in the list
            const userItem = document.createElement('div');
            userItem.textContent = user;
            userItem.classList.add('user-item');
            
            // When a user is clicked, set them as the recipient
            userItem.addEventListener('click', () => {
                selectedRecipient = user;
                alert(`You are now messaging ${user}`);
            });

            userList.appendChild(userItem); // Append the user to the list
        }
    });
});

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