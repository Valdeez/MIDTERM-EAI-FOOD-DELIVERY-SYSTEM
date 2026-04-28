const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    // Memberi nama unik: timestamp + ekstensi asli
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
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
  const { search } = req.query;
  let sqlQuery = "SELECT * FROM restaurants";
  let queryParams = [];

  if (search) {
    sqlQuery += " WHERE name LIKE ?";
    queryParams.push(`%${search}%`);
  }

  db.query(sqlQuery, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil mengambil data restoran", data: results });
  });
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

app.post("/api/restaurants", upload.single("image"), (req, res) => {
  const { name, address, is_active, deskripsi, jam_operasional, rating } =
    req.body;
  const imagePath = req.file ? `/public/uploads/${req.file.filename}` : null;

  db.query(
    "INSERT INTO restaurants (name, address, is_active, image, deskripsi, jam_operasional, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      address,
      is_active !== undefined ? is_active : true,
      imagePath,
      deskripsi || null,
      jam_operasional || null,
      rating || null,
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Restoran berhasil ditambahkan",
        id: results.insertId,
        imageUrl: imagePath,
      });
    },
  );
});

// UPDATE Restoran (Hanya Crew Restoran Tersebut)
app.put("/api/restaurants/:id", upload.single("image"), (req, res) => {
  const restoId = req.params.id;
  const {
    name,
    address,
    deskripsi,
    jam_operasional,
    is_active,
    crew_restaurant_id,
  } = req.body;

  // Validasi Otorisasi Crew
  if (parseInt(crew_restaurant_id) !== parseInt(restoId)) {
    return res.status(403).json({
      message:
        "Akses ditolak: Anda hanya dapat mengedit restoran Anda sendiri.",
    });
  }

  let sqlQuery =
    "UPDATE restaurants SET name=?, address=?, deskripsi=?, jam_operasional=?, is_active=? WHERE id=?";
  let queryParams = [
    name,
    address,
    deskripsi,
    jam_operasional,
    is_active,
    restoId,
  ];

  // Jika crew mengupload gambar baru
  if (req.file) {
    sqlQuery =
      "UPDATE restaurants SET name=?, address=?, deskripsi=?, jam_operasional=?, is_active=?, image=? WHERE id=?";
    queryParams = [
      name,
      address,
      deskripsi,
      jam_operasional,
      is_active,
      `/public/uploads/${req.file.filename}`,
      restoId,
    ];
  }

  db.query(sqlQuery, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Detail restoran berhasil diperbarui" });
  });
});

// --- MENU ENDPOINTS ---

app.get("/api/menus/detail", (req, res) => {
  const { restaurant_id } = req.query;
  db.query(
    "SELECT * FROM menus WHERE restaurant_id = ?",
    [restaurant_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil mengambil menu", data: results });
    },
  );
});

// POST tambah menu (Dengan Gambar)
app.post("/api/menus", upload.single("image"), (req, res) => {
  const { restaurant_id, name, price, description, crew_restaurant_id } =
    req.body;

  if (parseInt(crew_restaurant_id) !== parseInt(restaurant_id)) {
    return res.status(403).json({
      message: "Akses ditolak: Tidak dapat menambah menu di restoran lain.",
    });
  }

  const imagePath = req.file ? `/public/uploads/${req.file.filename}` : null;

  db.query(
    "INSERT INTO menus (restaurant_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)",
    [restaurant_id, name, price, description, imagePath],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Menu berhasil ditambahkan", id: results.insertId });
    },
  );
});

// PUT update menu (Dengan Gambar)
app.put("/api/menus/:id", upload.single("image"), (req, res) => {
  const menuId = req.params.id;
  const { name, price, description, crew_restaurant_id } = req.body;

  let sqlQuery =
    "UPDATE menus SET name = ?, price = ?, description = ? WHERE id = ? AND restaurant_id = ?";
  let queryParams = [name, price, description, menuId, crew_restaurant_id];

  if (req.file) {
    sqlQuery =
      "UPDATE menus SET name = ?, price = ?, description = ?, image = ? WHERE id = ? AND restaurant_id = ?";
    queryParams = [
      name,
      price,
      description,
      `/public/uploads/${req.file.filename}`,
      menuId,
      crew_restaurant_id,
    ];
  }

  db.query(sqlQuery, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res
        .status(403)
        .json({ message: "Akses ditolak atau menu tidak ditemukan" });
    res.json({ message: "Menu berhasil diupdate" });
  });
});

// DELETE menu
app.delete("/api/menus/:id", (req, res) => {
  const menuId = req.params.id;
  const { crew_restaurant_id } = req.body;

  db.query(
    "DELETE FROM menus WHERE id = ? AND restaurant_id = ?",
    [menuId, crew_restaurant_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res
          .status(403)
          .json({ message: "Akses ditolak atau menu tidak ditemukan" });
      res.json({ message: "Menu berhasil dihapus" });
    },
  );
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});
