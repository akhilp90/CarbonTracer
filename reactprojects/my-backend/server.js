const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Hardcoded database credentials
const db = mysql.createConnection({
  host: 'localhost', // Replace with your host if different
  user: 'root', // Replace with your MySQL username
  password: 'Akhil@1234', // Replace with your MySQL password
  database: 'sih' // Replace with your MySQL database name
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  // Check if user already exists
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking user' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password' });
      }
      
      // Insert new user into database
      const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(query, [username, hash], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error registering user' });
        }
        res.status(200).json({ message: 'User registered successfully' });
      });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Find user in database
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding user' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const user = results[0];
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords' });
      }
      if (result) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
