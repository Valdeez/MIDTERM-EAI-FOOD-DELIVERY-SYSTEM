const express = require("express");
const mysql = require("mysql2");
const app = express();
app.use(express.json());

// Menambahkan ini agar folder 'public' bisa diakses lewat URL (untuk gambar lokal)
app.use("/public", express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_restaurant",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to db_restaurant");
});

// --- RESTAURANT ENDPOINTS ---

app.get("/api/restaurants", (req, res) => {
  db.query(
    "SELECT * FROM restaurants WHERE is_active = true",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil mengambil data restoran", data: results });
    },
  );
});

app.get("/api/restaurants/detail", (req, res) => {
  const { id } = req.query;
  db.query("SELECT * FROM restaurants WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Restoran tidak ditemukan" });
    res.json({
      message: "Berhasil mengambil detail restoran",
      data: results[0],
    });
  });
});

app.post("/api/restaurants", (req, res) => {
  // Menambahkan ekstraksi data baru dari body
  const {
    name,
    address,
    is_active,
    image,
    deskripsi,
    jam_operasional,
    rating,
  } = req.body;

  // Memperbarui query INSERT dengan kolom baru
  db.query(
    "INSERT INTO restaurants (name, address, is_active, image, deskripsi, jam_operasional, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      address,
      is_active !== undefined ? is_active : true,
      image || null,
      deskripsi || null,
      jam_operasional || null,
      rating || null,
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({
          message: "Restoran berhasil ditambahkan",
          id: results.insertId,
        });
    },
  );
});

// --- MENU ENDPOINTS ---

app.get("/api/menus", (req, res) => {
  db.query("SELECT * FROM menus", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil mengambil data menu", data: results });
  });
});

app.put("/api/menus/:id", (req, res) => {
  const menuId = req.params.id;
  const { name, price, description, image, crew_restaurant_id } = req.body;

  db.query(
    "UPDATE menus SET name = ?, price = ?, description = ?, image = ? WHERE id = ? AND restaurant_id = ?",
    [name, price, description, image || null, menuId, crew_restaurant_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) {
        return res
          .status(403)
          .json({
            message:
              "Akses ditolak: Menu bukan milik restoran Anda atau menu tidak ditemukan",
          });
      }
      res.json({ message: "Data menu berhasil diperbarui oleh kru" });
    },
  );
});

app.get("/api/menus/detail", (req, res) => {
  const { restaurant_id } = req.query;
  db.query(
    "SELECT * FROM menus WHERE restaurant_id = ?",
    [restaurant_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        message: `Berhasil mengambil menu untuk restoran ID ${restaurant_id}`,
        data: results,
      });
    },
  );
});

app.post("/api/menus", (req, res) => {
  const { restaurant_id, name, price, description, image } = req.body;

  db.query(
    "INSERT INTO menus (restaurant_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)",
    [restaurant_id, name, price, description, image || null],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Menu berhasil ditambahkan", id: results.insertId });
    },
  );
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});
