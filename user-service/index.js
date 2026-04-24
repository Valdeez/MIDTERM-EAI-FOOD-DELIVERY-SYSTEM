const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const app = express();

app.use(cors()); 
app.use(express.json());

const db = mysql.createConnection({ 
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'db_user' 
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal:', err.message);
    } else {
        console.log('Berhasil terhubung ke MySQL (db_user) 🗄️');
    }
});

app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Berhasil mengambil data user", data: results });
    });
});

app.post('/api/users', (req, res) => {
    const { name, password, role, restaurant_id } = req.body;
    
    const assignRole = role || 'customer';

    db.query('INSERT INTO users (name, password, role, restaurant_id) VALUES (?, ?, ?, ?)', 
    [name, password, assignRole, restaurant_id || null], 
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            message: `User berhasil didaftarkan sebagai ${assignRole}`, 
            user_id: results.insertId 
        });
    });
});

app.post('/api/login', (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "Nama dan kata sandi harus diisi!" });
    }

    db.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const user = results[0];
            res.json({ 
                message: "Login berhasil", 
                data: {
                    id: user.id,
                    name: user.name,
                    role: user.role, 
                    restaurant_id: user.restaurant_id
                } 
            });
        } else {
            res.status(401).json({ error: "Nama atau kata sandi salah!" });
        }
    });
});

app.listen(3004, () => console.log('User Service berjalan lancar di Port 3004 🚀'));