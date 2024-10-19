
// Import necessary modules
const mysql = require('mysql2')
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded({ extended: true });
const crypto = require('crypto');
const { error } = require('console');

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
    // Connection Error, throws an error
    throw err;
  }
  // Connection was sucessful
  console.log('Connected to MySQL database');
});


//
// Start of Routes
//

// Route to serve welcomepage.html when visiting the root URL
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcomepage.html'));
});

// Route to get all users (TESTING DATABASE)
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM Users';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});


// Route for login functionality
app.post('/public/login', encoder, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if password is defined before attempting to hash it
  if (!password || !username) {
    return res.status(400).json({ error: "Username or password not provided" });
  }

  // Hash the input password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const query = "SELECT * FROM Users WHERE Username = ?";

  db.query(query, [username], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length === 0) {
      // Username not found
      return res.redirect("/login.html?error=username");
    } else if (results[0].Password !== hashedPassword) {
      // Incorrect password
      return res.redirect(`/login.html?error=password&username=${encodeURIComponent(username)}`);
    }

    // User found, password matches
    res.redirect("/homepage.html");
  });
});


// Route for successful login
app.get("/", function (req, res) {
  res.sendFile(__dirname, 'public', 'homepage.html');
})

// Route for failed login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'browse.html'));
});



// Route for user signup (registering a new user)
app.post('/public/signup', encoder, (req, res) => {
  // Take the form data from signup request
  const username = req.body.username;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phoneNumber = req.body.phoneNumber;
  const email = req.body.email;
  const password = req.body.password;
  const admin = false;
  const banned = false;
  const profilePicture = req.body.profilePicture;
  const bio = req.body.bio;

  // Hash the input password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // SQL query to insert the new user into the 'Users' table
  const query = `INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Admin, Banned, Profile_Picture, Bio) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Execute the query and insert the new user
  db.query(query, [username, firstName, lastName, phoneNumber, email, hashedPassword, admin, banned, profilePicture, bio], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows > 0) {
      // If the signup is successful, redirect to the homepage
      res.redirect("/homepage.html");
    }
    else {
      // If signup fails, redirect back to the signup page
      res.redirect("/signup.html");
    }

  });
});
//

// Start  of the server on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
