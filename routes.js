// Import necessary modules
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Directory to store uploaded files
    cb(null, 'public/uploads'); 
  },
  filename: (req, file, cb) => {
    // Unique filename
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

// Route to get all users (TESTING DATABASE)
router.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM Users';
  req.db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Route for login functionality
router.post('/public/login', upload.none(), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!password || !username) {
    return res.status(400).json({ error: "Username or password not provided" });
  }

  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const query = "SELECT * FROM Users WHERE Username = ?";
  req.db.query(query, [username], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length === 0) {
      return res.redirect("/login.html?error=username");
    } else if (results[0].Password !== hashedPassword) {
      return res.redirect(`/login.html?error=password&username=${encodeURIComponent(username)}`);
    }

    res.redirect("/homepage.html");
  });
});

// Route for user signup (registering a new user)
router.post('/public/signup', upload.single('profilePicture'), (req, res) => {
  const { username, firstName, lastName, phoneNumber, email, password, bio } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const checkQuery = "SELECT * FROM Users WHERE Username = ? OR Email = ?";
  req.db.query(checkQuery, [username, email], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      const errors = results.map(user => {
        if (user.Username === username) return 'username';
        if (user.Email === email) return 'email';
        return null;
      }).filter(Boolean);
      return res.redirect(`/signup.html?error=${errors.join('&')}`);
    }

    const query = `INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Admin, Banned, Profile_Picture, Bio) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    req.db.query(query, [username, firstName, lastName, phoneNumber, email, hashedPassword, false, false, profilePicture, bio], (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.redirect("/homepage.html");
    });
  });
});

// Ensure that the uploaded files can be accessed by the client.
router.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Export the router
module.exports = router;