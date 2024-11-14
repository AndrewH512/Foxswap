// Import necessary modules
const mysql = require('mysql2'); // MySQL database connection
const http = require('http'); // HTTP server creation
const { Server } = require('socket.io'); // Socket.IO for real-time communication
const express = require('express'); // Express framework for handling routes
const path = require('path'); // Path utilities for file and directory paths
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const session = require('express-session'); // Add session import
const encoder = bodyParser.urlencoded({ extended: true }); // Parse URL-encoded request bodies

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const users = {}; // Object to map usernames to socket IDs
const sockets = {}; // Object to map socket IDs to usernames

// Serve static files from the 'public' directory (HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Use body parser middleware to handle form data
app.use(encoder);

// Middleware to parse JSON bodies of incoming requests
app.use(express.json());

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
const router = require('./routes');
app.use('/', userRoutes);

// Route to serve welcomepage.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcomepage.html'));
});

// Catch-all route for 404 errors
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404page.html'));
});

// Route to serve homepage.html but only if the user is logged in
app.get('/homepage.html', (req, res) => {
  if (req.session.username) {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
  } else {
    res.redirect('/login.html');
  }
});


// Start of Set up real-time communication and user management with Socket.IO
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register the username in memory and send the user list on initial connection
  socket.on('register', (username) => {
    users[username] = socket.id;
    sockets[socket.id] = username;
    console.log(`Registered ${username} with ID: ${socket.id}`);

    // Fetch all users from the database
    db.query('SELECT Username FROM Users', (err, results) => {
      if (err) {
        console.error('Error fetching users from database:', err);
        return;
      }
      // Emit the list of usernames to the client
      const userList = results.map((row) => row.Username);
      io.emit('user list', userList);
      console.log(userList)
    });

    // Fetch undelivered messages for the user
    const query = 'SELECT * FROM Messages WHERE Recipient = ? AND isDelivered = FALSE ORDER BY Timestamp ASC';
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error('Error fetching undelivered messages:', err);
        return;
      }
      results.forEach((msg) => {
        socket.emit('private message', { from: msg.Sender, message: msg.Message });
      });

      // Notify the user of the number of unread messages
      const unreadCount = results.length;
      if (unreadCount > 0) {
        socket.emit('notification', { count: unreadCount });
      }

      // Mark messages as delivered
      if (results.length > 0) {
        const updateQuery = 'UPDATE Messages SET isDelivered = TRUE WHERE Recipient = ? AND isDelivered = FALSE';
        db.query(updateQuery, [username], (err) => {
          if (err) console.error('Error updating message delivery status:', err);
        });
      }
    });
  });

  // Handle private messaging and save chat history
  socket.on('private message', ({ to, message }) => {
    const targetSocketId = users[to];
    const senderUsername = sockets[socket.id];

    /// Save message to MySQL database with delivery and read status
    const query = 'INSERT INTO Messages (Sender, Recipient, Message, isDelivered, isRead) VALUES (?, ?, ?, ?, ?)';
    const isDelivered = targetSocketId ? true : false; // Determine delivery status
    const isRead = false; // New messages are unread by default
    db.query(query, [senderUsername, to, message, isDelivered, isRead], (err, result) => {
      if (err) {
        console.error('Error saving message to database:', err);
      } else {
        console.log('Message saved to database:', result.insertId);
        // If the recipient is online, emit the message to them
        io.to(targetSocketId).emit('private message', { from: senderUsername, message });
        // Send the message back to the sender (for confirmation)
        socket.emit('private message', { from: senderUsername, message });
        console.log(`Message from ${senderUsername} to ${to}: ${message}`);
        // Emit to the sender to update their chat user list
        socket.emit('update user list');
      }
    });
  });

  // Clean up users and update user list when a user disconnects
  socket.on('disconnect', () => {
    const username = sockets[socket.id];
    if (username) {
      delete users[username];
      delete sockets[socket.id];
      // Update user list for all clients
      db.query('SELECT Username FROM Users', (err, results) => {
        if (!err) {
          const userList = results.map((row) => row.username);
          io.emit('user list', userList);
        }
      });
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
