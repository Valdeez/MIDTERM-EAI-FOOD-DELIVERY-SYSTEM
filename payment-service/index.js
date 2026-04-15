const express = require('express');
const axios = require('axios'); // Digunakan untuk memanggil Order Service
const mysql = require('mysql2');
const app = express();
app.use(express.json());

// Koneksi ke db_payment
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'db_payment' });

// Skenario Integrasi: Verifikasi Pembayaran & Update Order
app.put('/api/payments/status', (req, res) => {
    const { order_id, status } = req.body; 

    // 1. Update status di database Payment (Unpaid -> Paid)
    db.query('UPDATE payments SET status = ? WHERE order_id = ?', [status, order_id], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. INTER-SERVICE COMMUNICATION: Jika sukses, panggil API Order Service
        if (status === 'Paid') {
            try {
                // Memanggil endpoint Order Service untuk mengubah status pesanan jadi 'Diproses'
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