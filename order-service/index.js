const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_order",
});

app.put("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Status pesanan berhasil diperbarui" });
    },
  );
});

app.post("/api/orders", (req, res) => {
  const { user_id, restaurant_id, total_amount } = req.body;
  db.query(
    'INSERT INTO orders (user_id, restaurant_id, total_amount, status) VALUES (?, ?, ?, "Pending")',
    [user_id, restaurant_id, total_amount],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Pesanan berhasil dibuat",
        order_id: results.insertId,
      });
    },
  );
});

app.put("/api/orders/approve", (req, res) => {
  const { order_id, restaurant_id } = req.body;

  db.query(
    'UPDATE orders SET status = "Diproses" WHERE id = ? AND restaurant_id = ?',
    [order_id, restaurant_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) {
        return res.status(403).json({
          message:
            "Gagal approve: Pesanan tidak ditemukan atau bukan milik restoran kru ini",
        });
      }
      res.json({ message: `Pesanan ${order_id} sedang diproses oleh kru.` });
    },
  );
});

app.get("/api/orders", (req, res) => {
  const { status, user_id, restaurant_id } = req.query;
  let sql = "SELECT * FROM orders WHERE 1=1";
  let params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (user_id) {
    sql += " AND user_id = ?";
    params.push(user_id);
  }
  if (restaurant_id) {
    sql += " AND restaurant_id = ?";
    params.push(restaurant_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: "Berhasil mengambil data pesanan",
      data: results,
    });
  });
});

app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM orders WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    res.json({
      message: "Berhasil mengambil detail pesanan",
      data: results[0],
    });
  });
});

app.post("/api/order-items", (req, res) => {
  const { order_id, menu_id, qty, price } = req.body;

  // Validasi input dasar
  if (!order_id || !menu_id || !qty || !price) {
    return res
      .status(400)
      .json({ error: "order_id, menu_id, qty, dan price wajib diisi" });
  }

  const sql =
    "INSERT INTO order_items (order_id, menu_id, qty, price) VALUES (?, ?, ?, ?)";
  db.query(sql, [order_id, menu_id, qty, price], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Item berhasil ditambahkan ke keranjang",
      item_id: results.insertId,
    });
  });
});

app.put("/api/order-items/:id", (req, res) => {
  const itemId = req.params.id;
  const { qty } = req.body;

  if (qty === undefined || qty < 1) {
    return res.status(400).json({ error: "Kuantitas (qty) tidak valid" });
  }

  const sql = "UPDATE order_items SET qty = ? WHERE id = ?";
  db.query(sql, [qty, itemId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Item tidak ditemukan di keranjang" });
    }

    res.json({ message: "Jumlah item berhasil diperbarui" });
  });
});

app.delete("/api/order-items/:id", (req, res) => {
  const itemId = req.params.id;

  const sql = "DELETE FROM order_items WHERE id = ?";
  db.query(sql, [itemId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    res.json({ message: "Item berhasil dihapus dari keranjang" });
  });
});

app.get("/api/order-items/:order_id", (req, res) => {
  const orderId = req.params.order_id;

  const sql = "SELECT * FROM order_items WHERE order_id = ?";
  db.query(sql, [orderId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: `Berhasil mengambil detail keranjang untuk Order #${orderId}`,
      data: results,
    });
  });
});

app.listen(3002, () => console.log("Order Service running on port 3002"));
