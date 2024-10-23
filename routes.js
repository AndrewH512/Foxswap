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

    // If login is successful, save the username in the session
    req.session.username = username;
    res.redirect(`/homepage.html?username=${encodeURIComponent(username)}`);
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
      req.session.username = username;
      res.redirect(`/homepage.html?username=${encodeURIComponent(username)}`);
    });
  });
});

// API route to get data from two tables
router.get('/data', (req, res) => {
  const query = `
    SELECT 
    Books.Author, 
    Books.ISBN, 
    Books.Title, 
    Books.Book_Subject, 
    Books.Cover_Picture,
    Posts.Seller, 
    Posts.Status, 
    Posts.Price, 
    Posts.Class_Name, 
    Posts.Book_Condition, 
    Posts.Due_Date, 
    Posts.Transaction_Type
FROM 
    Books
JOIN 
    Posts ON Books.Book_ID = Posts.Book_ID;`;
  req.db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// Route for posting a book (create a listing)
router.post('/public/post', upload.single('coverPicture'), (req, res) => {
  const { author, isbn, title, bookSubject, className, price, bookCondition, transactionType, dueDate } = req.body;
  const coverPicture = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if the dueDate is empty, and if so, set it to null
  const dueDateValue = dueDate ? dueDate : null;

  const checkQuery = "SELECT * FROM Books WHERE ISBN = ?";
  req.db.query(checkQuery, [isbn], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      const errors = results.map(book => {
        if (book.ISBN === isbn) return 'ISBN';
        return null;
      }).filter(Boolean);
      return res.redirect(`/post.html?error=${errors.join('&')}`);
    }

    // Insert into the book table
    const insertBook = `INSERT INTO Books (Author, ISBN, Title, Book_Subject, Cover_Picture) VALUES (?, ?, ?, ?, ?)`;
    req.db.query(insertBook, [author, isbn, title, bookSubject, coverPicture], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get the Book_ID of the newly inserted book
      const bookID = result.insertId; // Use insertId directly after insert
      console.log("Inserted Book ID:", bookID);
      const status = 'Available';  // Default status to 'Available' 
      // Now you can insert into the Posts table
      const seller = req.session.username;

      const insertPost = `INSERT INTO Posts (Seller, Book_ID, Status, Price, Class_Name, Book_Condition, Due_Date, Transaction_Type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      req.db.query(insertPost, [seller, bookID, status, price, className, bookCondition, dueDateValue, transactionType], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        console.log('Post Complete.');
        res.redirect(`/homepage.html?username=${encodeURIComponent(seller)}`);
      });
    });
  });
});





// Route to check if the user is logged in (for frontend session management)
router.get('/api/check-session', (req, res) => {
  if (req.session && req.session.username) {
    // Return true if the user is already logged in
    res.json({ authenticated: true, username: req.session.username });
  } else {
    // Return false if the user hasn't logged in yet
    res.json({ authenticated: false });
  }
});

// Ensure that the uploaded files can be accessed by the client.
router.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Export the router
module.exports = router;