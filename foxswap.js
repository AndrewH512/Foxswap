const mysql = require('mysql2')
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

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

// Route to get all posts (TESTING DATABASE)
app.get('/api/posts', (req, res) => {
  const query = 'SELECT * FROM Posts';
  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(results);
  });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});