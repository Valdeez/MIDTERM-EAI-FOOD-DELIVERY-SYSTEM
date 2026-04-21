const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'db_user' });

app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Berhasil mengambil data user", data: results });
    });
});

app.post('/api/users', (req, res) => {
    const { name, role, restaurant_id } = req.body;
    db.query('INSERT INTO users (name, role, restaurant_id) VALUES (?, ?, ?)', 
    [name, role, restaurant_id || null], 
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "User berhasil didaftarkan", user_id: results.insertId });
    });
});

app.listen(3004, () => console.log('User Service running on port 3004'));