// Import necessary modules
const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded({ extended: true });

// Initialize Express app
const app = express();
const port = 3000;

// Serve static files from the 'public' directory (HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));
app.use(encoder);

// Database connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: 'marist123', // replace with your MySQL password
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
  // Attach the db connection to the request object
  req.db = db; 
  // Move to the next middleware or route
  next(); 
});

// Import user routes
const userRoutes = require('./routes');

// Start of Routes
app.use('/', userRoutes);

// Route to serve welcomepage.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcomepage.html'));
});

// Start of the server on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

