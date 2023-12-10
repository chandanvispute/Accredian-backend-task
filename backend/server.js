const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;
app.use(bodyParser.json());
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Chandan@2003',
  database: 'my-login-page',
});
db.on('error', (err) => {
  console.error('MySQL database connection error:', err.message);
}); 
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  console.log(usernameOrEmail);
  console.log('Executing query:', "SELECT * FROM `my-login-page`.`login-user-pass` WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail]);
  db.query("SELECT * FROM `my-login-page`.`login-user-pass` WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (results.length === 0) {
      console.log(results);
      return res.status(401).json({ message: 'Result length is zero' });
    }
    const isPasswordValid = await bcrypt.compare(password, results[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful' });
  });
});
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if username or email already exists
  db.query("SELECT * FROM `my-login-page`.`login-user-pass` WHERE username = ? OR email = ?", [username, email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (results.length > 0) {
      // User already exists
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // If user does not exist, insert into the database
    db.query("INSERT INTO `my-login-page`.`login-user-pass` (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], (insertErr, insertResult) => {
      if (insertErr) {
        return res.status(500).json({ message: 'Internal server error' });
      }

      // User registered successfully
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
/*SyntaxError: Unexpected token 'E', "Error occu"... is not valid JSON*/