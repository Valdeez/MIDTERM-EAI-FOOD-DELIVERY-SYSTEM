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

// app.get("/api/restaurants", (req, res) => {
//   db.query(
//     "SELECT * FROM restaurants WHERE is_active = true",
//     (err, results) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ message: "Berhasil mengambil data restoran", data: results });
//     },
//   );
// });

app.get("/api/restaurants", (req, res) => {
  const { search } = req.query; // Menangkap kata kunci dari URL

  let sqlQuery = "SELECT * FROM restaurants WHERE is_active = true";
  let queryParams = [];

  // Jika ada parameter search, tambahkan filter LIKE untuk mencari nama yang mirip
  if (search) {
    sqlQuery += " AND name LIKE ?";
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

  // Ambil path file yang baru saja diupload
  const imagePath = req.file ? `/public/uploads/${req.file.filename}` : null;

  db.query(
    "INSERT INTO restaurants (name, address, is_active, image, deskripsi, jam_operasional, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      address,
      is_active !== undefined ? is_active : true,
      imagePath, // Simpan path gambar ke DB
      deskripsi || null,
      jam_operasional || null,
      rating || null,
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Restoran berhasil ditambahkan dengan gambar",
        id: results.insertId,
        imageUrl: imagePath,
      });
    },
  );
});

// --- MENU ENDPOINTS ---

// GET semua menu
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
        return res.status(403).json({
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

// POST tambah menu
app.post("/api/menus", (req, res) => {
  const { restaurant_id, name, price, description } = req.body;

  db.query(
    "INSERT INTO menus (restaurant_id, name, price, description) VALUES (?, ?, ?, ?)",
    [restaurant_id, name, price, description],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Menu berhasil ditambahkan",
        id: results.insertId,
      });
    },
  );
});

// PUT update menu
app.put("/api/menus/:id", (req, res) => {
  const menuId = req.params.id;
  const { name, price, description, restaurant_id } = req.body;

  db.query(
    "UPDATE menus SET name = ?, price = ?, description = ? WHERE id = ? AND restaurant_id = ?",
    [name, price, description, menuId, restaurant_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.affectedRows === 0) {
        return res.status(403).json({
          message: "Akses ditolak / menu tidak ditemukan",
        });
      }

      res.json({ message: "Menu berhasil diupdate" });
    },
  );
});

// DELETE menu
app.delete("/api/menus/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM menus WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }

    res.json({ message: "Menu berhasil dihapus" });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});
