const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

// Koneksi ke database db_restaurant
const db = mysql.createConnection({ 
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'db_restaurant' 
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to db_restaurant');
});

// ==========================================
// ENDPOINT RESTAURANT
// ==========================================

// 1. Dapatkan daftar semua restoran (Query restoran aktif)
// Sesuai rancangan: GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
    // Berdasarkan flow, kita query restoran yang aktif
    db.query('SELECT * FROM restaurants WHERE is_active = true', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Berhasil mengambil data restoran", data: results });
    });
});

// 2. Dapatkan detail restoran spesifik
// Sesuai rancangan: GET /api/restaurants/detail
app.get('/api/restaurants/detail', (req, res) => {
    const { id } = req.query; // Menggunakan query parameter, misal: /api/restaurants/detail?id=1
    db.query('SELECT * FROM restaurants WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Restoran tidak ditemukan" });
        res.json({ message: "Berhasil mengambil detail restoran", data: results[0] });
    });
});

// 3. Tambah restoran baru
// Sesuai rancangan: POST /api/restaurants
app.post('/api/restaurants', (req, res) => {
    const { name, address, is_active } = req.body;
    db.query('INSERT INTO restaurants (name, address, is_active) VALUES (?, ?, ?)', 
    [name, address, is_active !== undefined ? is_active : true], 
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Restoran berhasil ditambahkan", id: results.insertId });
    });
});

// ==========================================
// ENDPOINT MENU
// ==========================================

// 4. Dapatkan daftar semua menu
// Sesuai rancangan: GET /api/menus
app.get('/api/menus', (req, res) => {
    db.query('SELECT * FROM menus', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Berhasil mengambil data menu", data: results });
    });
});

// 5. Dapatkan detail menu spesifik (Bisa berdasarkan restaurant_id)
// Sesuai rancangan: GET /api/menus/detail
app.get('/api/menus/detail', (req, res) => {
    const { restaurant_id } = req.query; // Misal mencari menu untuk restoran tertentu
    db.query('SELECT * FROM menus WHERE restaurant_id = ?', [restaurant_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Berhasil mengambil menu untuk restoran ID ${restaurant_id}`, data: results });
    });
});

// 6. Tambah menu baru
// Sesuai rancangan: POST /api/menus
app.post('/api/menus', (req, res) => {
    const { restaurant_id, name, price, description } = req.body;
    db.query('INSERT INTO menus (restaurant_id, name, price, description) VALUES (?, ?, ?, ?)', 
    [restaurant_id, name, price, description], 
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Menu berhasil ditambahkan", id: results.insertId });
    });
});

// Jalankan server di port 3001
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Restaurant Service running on port ${PORT}`);
});