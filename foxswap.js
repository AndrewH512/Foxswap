const mysql = require('mysql2')
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded({ extended: true });
const crypto = require('crypto');
const { error } = require('console');

const app = express();
const port = 3000;
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

// Route to check user login
app.post('/public/login', encoder, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if password is defined before attempting to hash it
  if (!password || !username) {
    return res.status(400).json({ error: "Username or password not provided" });
  }

  // Hash the input password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const query = "SELECT * FROM Users WHERE Username = ? AND Password = ?";
  db.query(query, [username, hashedPassword], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      res.redirect("/homepage.html");
    } else {
      res.redirect("/login.html");
    }
  });
});


// When login is successs
app.get("/", function (req, res) {
  res.sendFile(__dirname, 'public', 'homepage.html');
})

// When login fails
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'browse.html'));
});

/*
  This is where the code for our sign up page is going!
*/

app.post('/public/signup', encoder, (req, res) => {
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

  const query = "INSERT INTO Users (Username = ?, First_Name = ?, Last_Name = ?, Phone_Number = ?, Email = ?, Password = ?, Admin = ?, Banned = ?, Profile_Picture = ?, Bio = ?)";

  db.query(query, [username, firstName, lastName, phoneNumber, email, hashedPassword, admin, banned, profilePicture, bio], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      res.redirect("/homepage.html");
    }
    else {
      res.redirect("/signup.html");
    }

  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
