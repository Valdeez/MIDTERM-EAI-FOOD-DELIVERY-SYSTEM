const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

// Koneksi ke db_order
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'db_order' });

// Endpoint yang dipanggil oleh Payment Service (Sesuai Flow 3)
app.put('/api/orders/status', (req, res) => {
    const { order_id, status } = req.body;

    db.query('UPDATE orders SET status = ? WHERE id = ?', [status, order_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Status pesanan ${order_id} berhasil diubah menjadi ${status}` });
    });
});

app.listen(3002, () => console.log('Order Service running on port 3002'));