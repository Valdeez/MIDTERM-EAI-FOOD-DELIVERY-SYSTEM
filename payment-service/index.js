const express = require('express');
const axios = require('axios'); 
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'db_payment' });

app.post('/api/payments', (req, res) => {
    const { order_id, payment_method, amount } = req.body;
    const va_number = '88' + Math.floor(1000000000 + Math.random() * 9000000000); 
    
    db.query('INSERT INTO payments (order_id, payment_method, va_number, amount, status) VALUES (?, ?, ?, ?, "Unpaid")', 
    [order_id, payment_method, va_number, amount], 
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Tagihan berhasil dibuat", va_number: va_number });
    });
});

app.put('/api/payments/status', (req, res) => {
    const { order_id, status } = req.body; 

    db.query('UPDATE payments SET status = ? WHERE order_id = ?', [status, order_id], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (status === 'Paid') {
            try {
                await axios.put(`http://localhost:3002/api/orders/status`, {
                    order_id: order_id,
                    status: 'Diproses'
                });
                
                return res.json({ message: "Pembayaran lunas, notifikasi ke Order Service berhasil. Makanan diproses." });
            } catch (error) {
                return res.status(500).json({ message: "Pembayaran berhasil, tapi gagal mengupdate Order Service", error: error.message });
            }
        }
        res.json({ message: "Status pembayaran diupdate" });
    });
});

app.listen(3003, () => console.log('Payment Service running on port 3003'));