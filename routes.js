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

// Function to generate a random salt
function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

// Now Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Start of Routes Here

// Route for login functionality
router.post('/public/login', upload.none(), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!password || !username) {
    return res.status(400).json({ error: "Username or password not provided" });
  }

  // Query to find user by username
  const query = "SELECT * FROM Users WHERE Username = ?";
  req.db.query(query, [username], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length === 0) {
      return res.redirect("/login.html?error=username");
    }

    // Check if the user is banned
    if (results[0].Banned) {
      return res.redirect(`/login.html?error=banned&username=${encodeURIComponent(username)}`);
    }

    // Retrieve the salt and hash the password for comparison
    const salt = results[0].Salt;
    const hashedPassword = crypto.createHash('sha256').update(password + salt).digest('hex');

    // Check if the hashed password matches
    if (results[0].Password !== hashedPassword) {
      return res.redirect(`/login.html?error=password&username=${encodeURIComponent(username)}`);
    }

    // Successful login
    req.session.username = username;
    req.session.admin = results[0].Admin;
    res.redirect(`/homepage.html?username=${encodeURIComponent(username)}`);
  });
});

router.post('/public/signup', upload.single('profilePicture'), (req, res) => {
  const { username, firstName, lastName, phoneNumber, email, password, bio } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  // Generate a new salt
  const salt = generateSalt();

  // Hash the password with the salt
  const hashedPassword = crypto.createHash('sha256').update(password + salt).digest('hex');

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
    const query = `INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Salt, Admin, Banned, Profile_Picture, Bio) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    req.db.query(query, [username, firstName, lastName, phoneNumber, email, hashedPassword, salt, false, false, profilePicture, bio], (error, results) => {
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
    Posts ON Books.Book_ID = Posts.Book_ID
AND
    Posts.Display_Post = 1;`;
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
    Posts.Seller = ?
AND
    Posts.Display_Post = 1;`;
  req.db.query(query, [username], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// API route to get your data
router.get('/yourPost', (req, res) => {
  const postId = req.query.id;
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
    Posts.Post_ID = ?
AND
    Posts.Display_Post = 1;`;
  req.db.query(query, [postId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});


// API route to get their data
router.get('/theirData', (req, res) => {
  const seller = req.query.seller;
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
    Posts.Seller = ?
AND
    Posts.Display_Post = 1;`;
  req.db.query(query, [seller], (error, results) => {
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

  console.log("dueDate " + dueDate);

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

// Route for checking session
router.get('/api/check-session', (req, res) => {
  // Check if user is authenticated
  if (req.session && req.session.username) {
    // Query to get the user from the database
    const query = "SELECT Admin FROM Users WHERE Username = ?";
    req.db.query(query, [req.session.username], (error, results) => {
      if (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if the user exists
      if (results.length > 0) {
        const isAdmin = results[0].Admin;
        return res.json({
          authenticated: true,
          username: req.session.username,
          admin: isAdmin // Include the admin status
        });
      } else {
        console.warn("User not found:", req.session.username);
        return res.status(404).json({ authenticated: false });
      }
    });
  } else {
    // User is not authenticated
    return res.json({ authenticated: false });
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


router.get('/searchBooks', (req, res) => {
  const query = req.query.query;

  // SQL query to fetch data from Books and Posts
  const sqlQuery = `
      SELECT 
          Books.Title, 
          Books.Author, 
          Books.ISBN, 
          Books.Book_Subject,
          Books.Cover_Picture,
          Posts.Post_ID,
          Posts.Class_Name,
          Posts.Price,
          Posts.Seller, 
          Posts.Due_Date,
          Posts.Status,
          Posts.Book_Condition,
          Posts.Transaction_Type
      FROM 
          Books
      JOIN 
          Posts ON Books.Book_ID = Posts.Book_ID
      WHERE 
          (Books.Title LIKE ? 
          OR Books.Author LIKE ? 
          OR Books.ISBN LIKE ? 
          OR Posts.Class_Name LIKE ?)
      AND Posts.Display_Post = 1
  `;

  // Prepare parameters for the query
  const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

  // Use parameterized queries to prevent SQL injection
  req.db.query(sqlQuery, params, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Send the results back as JSON
    res.json(results);
  });
});

// Endpoint to retrieve unique chat users
router.get('/chat-users/:username', (req, res) => {
  const { username } = req.params;
  const query = `
      SELECT DISTINCT 
          CASE 
              WHEN Sender = ? THEN Recipient 
              ELSE Sender 
          END AS chatUser 
      FROM Messages 
      WHERE Sender = ? OR Recipient = ?
  `;
  req.db.query(query, [username, username, username], (err, results) => {
    if (err) {
      console.error('Error retrieving chat users:', err);
      res.status(500).send('Error retrieving chat users');
    } else {
      const chatUsers = results.map(row => row.chatUser);
      // Send unique chat users as JSON
      res.json(chatUsers);
    }
  });
});

// Mark all messages as deleted for a specific conversation
router.delete('/delete-chat/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  const query = `
    UPDATE Messages 
    SET 
      isDeletedBySender = CASE WHEN Sender = ? THEN TRUE ELSE isDeletedBySender END,
      isDeletedByRecipient = CASE WHEN Recipient = ? THEN TRUE ELSE isDeletedByRecipient END
    WHERE 
      (Sender = ? AND Recipient = ?) 
      OR (Sender = ? AND Recipient = ?)
  `;
  req.db.query(query, [user1, user1, user1, user2, user2, user1], (err) => {
    if (err) {
      console.error('Error marking chat as deleted:', err);
      return res.status(500).send('Error marking chat as deleted');
    }
    res.sendStatus(204); // No content to send back, operation successful
  });
});

// Mark all messages as read for a conversation between two users
router.post('/mark-as-read/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  const query = `
      UPDATE Messages 
      SET isRead = TRUE 
      WHERE (Sender = ? AND Recipient = ?) OR (Sender = ? AND Recipient = ?)
  `;
  req.db.query(query, [user1, user2, user2, user1], (err) => {
    if (err) {
      console.error('Error marking messages as read:', err);
      return res.status(500).send('Error marking messages as read');
    }
    res.sendStatus(204); // No content to send back, operation successful
  });
});



// Endpoint to update user profile
router.post('/api/updateProfile', upload.single('profilePic'), (req, res) => {
  const { firstName, lastName, bio, phoneNumber, password } = req.body;
  const profilePic = req.file ? `/uploads/${req.file.filename}` : null;
  const username = req.session.username;  // Assuming username is in the session

  // Check if a new password is provided
  let updatePassword = '';
  let salt = '';
  if (password) {
    salt = generateSalt();
    updatePassword = crypto.createHash('sha256').update(password + salt).digest('hex');
  }

  // SQL update query with conditional password and profile picture update
  const query = `
    UPDATE Users 
    SET 
      First_Name = ?, 
      Last_Name = ?, 
      Bio = ?, 
      Phone_Number = ?, 
      ${profilePic ? 'Profile_Picture = ?, ' : ''} 
      ${password ? 'Password = ?, Salt = ? ' : ''} 
    WHERE Username = ?`;

  const params = [
    firstName, lastName, bio, phoneNumber,
    ...(profilePic ? [profilePic] : []),
    ...(password ? [updatePassword, salt] : []),
    username
  ];

  req.db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    res.json({ message: 'Profile updated successfully' });
  });
});

router.get('/api/reports/users', (req, res) => {
  const username = req.session.username;

  const query = `
      SELECT DISTINCT
          CASE
              WHEN Sender = ? THEN Recipient
              ELSE Sender
          END AS messagee
      FROM Messages
      WHERE Sender = ? OR Recipient = ?;
  `;

  req.db.query(query, [username, username, username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

router.post('/api/report', (req, res) => {
  const { reportedUser, title, description } = req.body;
  const reporter = req.session.username;  // Assuming `username` is stored in the session

  console.log('Report data received:', { reportedUser, reporter, title, description });

  // Validate input
  if (!reportedUser || !reporter || !title || !description) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Insert report into the Reports table
  const query = `
    INSERT INTO Reports (Reported_User, Reporting_User, Title, Description)
    VALUES (?, ?, ?, ?)
  `;

  req.db.query(query, [reportedUser, reporter, title, description], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Report successfully inserted with ID:', result.insertId);
    res.json({ message: 'Report submitted successfully!' });

  });
});




router.put('/api/deletePost', (req, res) => {
  const postId = req.query.id;
  const displayPost = req.body.displayPost;

  const query = 'UPDATE Posts SET Display_Post = ? WHERE Post_ID = ?';
  req.db.query(query, [displayPost, postId], (error, results) => {
    if (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    } else {
      res.sendStatus(200); // Success
    }
  });
});

// Get only report titles and IDs for listReports.html
router.get('/api/listReports', (req, res) => {
  const query = `SELECT Report_ID, Title FROM Reports`;

  req.db.query(query, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(result);
  });
});

// Get full report details for viewReports.html
router.get('/api/report/:id', (req, res) => {
  const reportID = req.params.id;
  const query = `SELECT * FROM Reports WHERE Report_ID = ?`;

  req.db.query(query, [reportID], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(result[0]);
  });
});



router.put('/api/editPost', (req, res) => {
  const { transaction, buyer, price, dueDate } = req.body;
  const postId = parseInt(req.query.id);
  const seller = req.session.username;

  if (transaction === 'yes' && buyer) {

    // Get the current date and time
    const formattedDate = getFormattedDateTime();

    const insertTransactionQuery = `
      INSERT INTO Transaction (Post_ID, Buyer, Seller, Price, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    req.db.query(insertTransactionQuery, [postId, buyer, seller, price, formattedDate], (err, result) => {
      if (err) {
        console.log("Database error: ", err);  // Log the error details
        return res.status(500).send('Error inserting transaction details');
      }

      const updatePostQuery = 'UPDATE Posts SET Display_Post = 0, Status = ? WHERE Post_ID = ?';
      req.db.query(updatePostQuery, ["Sold or Rented", postId], (err, result) => {
        if (err) {
          return res.status(500).send('Error updating post visibility');
        }
        // Success response if everything went well
        res.status(200).json({ success: true });
      });
    });
  }
  else {
    if (dueDate) {
      const updatePostQuery = 'UPDATE Posts SET Price = ?, Due_Date = ? WHERE Post_ID = ?';
      req.db.query(updatePostQuery, [price, dueDate, postId], (err, result) => {
        if (err) {
          return res.status(500).send('Error updating post visibility');
        }
        // Success response if everything went well
        res.status(200).json({ success: true });
      });
    }
    else {
      const updatePostQuery = 'UPDATE Posts SET Price = ? WHERE Post_ID = ?';
      req.db.query(updatePostQuery, [price, postId], (err, result) => {
        if (err) {
          return res.status(500).send('Error updating post visibility');
        }
        // Success response if everything went well
        res.status(200).json({ success: true });
      });
    }
  }
});

function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Route to search for users based on the username or email
router.get('/api/search-users', (req, res) => {
  const query = req.query.query;
  const sql = 'SELECT * FROM Users WHERE Username LIKE ? OR Email LIKE ?';
  const values = [`%${query}%`, `%${query}%`];

  req.db.query(sql, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Route to ban a user based on their username
router.post('/api/ban-user/:username', (req, res) => {
  const username = req.params.username;
  const sql = 'UPDATE Users SET Banned = 1 WHERE Username = ?';  // Set banned flag to true

  req.db.query(sql, [username], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'User banned successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Route to unban a user based on their username
router.post('/api/unban-user/:username', (req, res) => {
  const username = req.params.username;
  const sql = 'UPDATE Users SET Banned = 0 WHERE Username = ?';  // Set banned flag to false

  req.db.query(sql, [username], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'User unbanned successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Router to view Transactions
router.get('/api/viewTran', (req, res) => {
  const sql = `
  SELECT
    t.Transaction_ID,             
    t.Buyer,                      
    t.Seller,                     
    t.Price AS Transaction_Price, 
    t.created_at AS Transaction_Date, 
    p.Post_ID,                    
    p.Status AS Post_Status,      
    p.Price AS Post_Price,       
    p.Class_Name,                 
    p.Book_Condition,             
    p.Transaction_Type,           
    p.Due_Date,                  
    b.Cover_Picture,           
    b.Title
  FROM
    Transaction t
  JOIN
    Posts p ON t.Post_ID = p.Post_ID      
  JOIN
    Books b ON p.Book_ID = b.Book_ID      
  ORDER BY
    t.created_at DESC;                    
  `;

  // Execute the query and send results back to the client
  req.db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// Route to change admin status
router.put('/api/change-admin-status/:username', (req, res) => {
  const username = req.params.username;
  const { isAdmin } = req.body; // isAdmin will be a boolean indicating the desired status

  // Ensure the value of isAdmin is a boolean
  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({ message: 'Invalid admin status' });
  }

  // Update the admin status in the Users table
  const sql = 'UPDATE Users SET Admin = ? WHERE Username = ?';
  req.db.query(sql, [isAdmin, username], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows > 0) {
      res.status(200).json({ message: `User ${isAdmin ? 'is now' : 'is no longer'} an admin` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});