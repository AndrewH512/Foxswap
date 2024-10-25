// Import necessary modules
const mysql = require('mysql2');
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session'); // Add session import
const encoder = bodyParser.urlencoded({ extended: true });

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const users = {}; // Object to map usernames to socket IDs
const sockets = {}; // Object to map socket IDs to usernames

// Serve static files from the 'public' directory (HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));
app.use(encoder);

// Set up session middleware
app.use(session({
  secret: 'secret-key', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Database connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'marist123',
  database: 'foxswap_db'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Middleware to attach db connection to req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Import user routes
const userRoutes = require('./routes');
app.use('/', userRoutes);

// Route to serve welcomepage.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcomepage.html'));
});

// Route to serve homepage.html but only if the user is logged in
app.get('/homepage.html', (req, res) => {
  if (req.session.username) {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
  } else {
    res.redirect('/login.html');
  }
});


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Store the user's socket ID and username
  socket.on('register', (username) => {
    users[username] = socket.id; // Map the username to the socket ID
    sockets[socket.id] = username; // Map the socket ID to the username
    console.log(`Registered ${username} with ID: ${socket.id}`);
  });

  socket.on('private message', ({ to, message }) => {
    const targetSocketId = users[to];
    const senderUsername = sockets[socket.id];

    if (targetSocketId) {
      // Send message to the recipient
      io.to(targetSocketId).emit('private message', { from: senderUsername, message });

      // Also send the message back to the sender
      socket.emit('private message', { from: 'You', message });
      console.log(`Message from ${senderUsername} to ${to}: ${message}`);
    } else {
      console.log(`User ${to} not found`);
    }
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    const username = sockets[socket.id];
    if (username) {
      delete users[username];
      delete sockets[socket.id];
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


