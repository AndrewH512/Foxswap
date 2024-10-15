const mysql = require('mysql')
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Database connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'Bluebutt9424$', // replace with your MySQL password
    database: 'foxswap_db'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
      throw err;
  }
  console.log('Connected to MySQL database');
});

// Route to serve homepage.html when visiting the root URL
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



