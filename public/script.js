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

// Form elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const recipient = prompt("Enter recipient's username:");
    if (message && recipient) {
        socket.emit('private message', { to: recipient, message }); // Send to the server
        messageInput.value = ''; // Clear input field
    }
});

// Listen for incoming private messages and display the sender's username, and send message back to sender
socket.on('private message', ({ from, message }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${from}: ${message}`;
    messagesDiv.appendChild(messageElement); // Append the message to the messages div
});