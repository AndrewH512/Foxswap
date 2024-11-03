// Import necessary modules
const express = require('express'); // Express framework for creating the server and routing
const router = express.Router();  // Router object to handle routes
const mysql = require('mysql2'); // MySQL library for database interactions
const crypto = require('crypto'); // Crypto library for hashing passwords
const multer = require('multer'); // Multer library for handling file uploads
const path = require('path');  // Path library for handling file paths

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

// Now Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Start of Routes Here

// Route for login functionality
router.post('/public/login', upload.none(), (req, res) => {
  // Retrieve the username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  // Now we want to check if username or password is missing
  if (!password || !username) {
    return res.status(400).json({ error: "Username or password not provided" });
  }

  // Hash the password using SHA-256, salt??
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // Query to find user by username
  const query = "SELECT * FROM Users WHERE Username = ?";
  req.db.query(query, [username], (error, results) => {
    if (error) {
      // Handles database error
      return res.status(500).json({ error: error.message });
    }

    // If no user is found, redirect to the login page with a username error
    if (results.length === 0) {
      return res.redirect("/login.html?error=username");
    }
    // If the password does not match, redirect with a password error
    else if (results[0].Password !== hashedPassword) {
      return res.redirect(`/login.html?error=password&username=${encodeURIComponent(username)}`);
    }

    // If login is successful, save the username in the session
    req.session.username = username;
    res.redirect(`/homepage.html?username=${encodeURIComponent(username)}`);
  });
});

// Route for user signup (registering a new user)
router.post('/public/signup', upload.single('profilePicture'), (req, res) => {
  // Get user information from the request body
  const { username, firstName, lastName, phoneNumber, email, password, bio } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // Check if the username or email already exists in the database
  const checkQuery = "SELECT * FROM Users WHERE Username = ? OR Email = ?";
  req.db.query(checkQuery, [username, email], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // If the username or email already exists, return an error
    if (results.length > 0) {
      const errors = results.map(user => {
        if (user.Username === username) return 'username';
        if (user.Email === email) return 'email';
        return null;
      }).filter(Boolean);
      return res.redirect(`/signup.html?error=${errors.join('&')}`);
    }

    // Insert the new user into the database
    const query = `INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Admin, Banned, Profile_Picture, Bio) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    req.db.query(query, [username, firstName, lastName, phoneNumber, email, hashedPassword, false, false, profilePicture, bio], (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Save the username in the session after successful registration
      req.session.username = username;
      res.redirect(`/homepage.html?username=${encodeURIComponent(username)}`);
    });
  });
});

// API route to get data from two tables
router.get('/data', (req, res) => {
  // SQL query to join Books and Posts tables and select relevant fields
  const query = `
    SELECT 
    Books.Author, 
    Books.ISBN, 
    Books.Title, 
    Books.Book_Subject, 
    Books.Cover_Picture,
    Posts.Post_ID,
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

// API route to get your data
router.get('/yourData', (req, res) => {
  const username = req.session.username;
  // SQL query to join Books and Posts tables and select relevant fields
  const query = `
    SELECT 
    Books.Author, 
    Books.ISBN, 
    Books.Title, 
    Books.Book_Subject, 
    Books.Cover_Picture,
    Posts.Post_ID,
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
    Posts ON Books.Book_ID = Posts.Book_ID
Where
    Posts.Seller = ?;`;
  req.db.query(query, [username], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// Route for posting a book (create a listing)
router.post('/public/post', upload.single('coverPicture'), (req, res) => {
  // Extract book and post data from the request body
  const { author, isbn, title, bookSubject, className, price, bookCondition, transactionType, dueDate } = req.body;
  const coverPicture = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if the dueDate is empty, and if so, set it to null
  const dueDateValue = dueDate ? dueDate : null;

  // Check if a book with the same ISBN already exists
  const checkQuery = "SELECT * FROM Books WHERE ISBN = ?";
  req.db.query(checkQuery, [isbn], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // If the ISBN already exists, return an error
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
      // Use insert_Id directly after insert
      const bookID = result.insertId;
      // Default status to 'Available' 
      const status = 'Available';
      // Now you can insert into the Posts table
      // Get the seller's username from the session
      const seller = req.session.username;

      // Insert the post data into the Posts table
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

// Route for logging out
router.get('/public/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    // Redirect to the login page after logout
    res.redirect('/welcomepage.html');
  });
});

// Ensure that the uploaded files can be accessed by the client.
router.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Export the router
module.exports = router;

// Route to get all users (TESTING DATABASE)
// Will get deleted later
router.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM Users';
  req.db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// Route to get detailed textbook information
router.get('/api/getPost', (req, res) => {
  const postId = req.query.id;

  const query = `
      SELECT 
          Books.Title,
          Books.Author,
          Books.ISBN,
          Books.Book_Subject,
          Books.Cover_Picture,
          Posts.Seller,
          Posts.Status,
          Posts.Price,
          Posts.Class_Name,
          Posts.Book_Condition,
          Posts.Due_Date,
          Posts.Transaction_Type
      FROM Posts
      INNER JOIN Books ON Posts.Book_ID = Books.Book_ID
      WHERE Posts.Post_ID = ?
  `;
  // Execute the query with the postId parameter to prevent SQL injection
  req.db.query(query, [postId], (error, results) => {
    if (error) {
      // Log error and respond with a 500 status code if an error occurs
      console.error('Error fetching post information:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else if (results.length === 0) {
      // If no results, send a 404 response indicating post not found
      res.status(404).json({ error: 'Post not found' });
    } else {
      // Send the first result as JSON, as only one post is expected
      res.json(results[0]);
    }
  });
});

// Route to search for users by a partial username
router.get('/search-user/:query', (req, res) => {
  // Extract search query from route parameter
  const query = req.params.query;

  // SQL query to search for usernames that contain the search query 
  const sqlQuery = 'SELECT Username FROM Users WHERE Username LIKE ?';

  // Execute query with wildcard search to match usernames containing the query string
  req.db.query(sqlQuery, [`%${query}%`], (err, results) => {
    if (err) {
      // Log error and respond with a 500 status code if an error occurs
      console.error('Error searching users:', err);
      res.status(500).send('Error searching users');
    } else {
      // Extract the 'Username' field from each row in the results and send as JSON
      const usernames = results.map(row => row.Username);
      res.json(usernames); // Send back matching usernames as JSON
    }
  });
});

