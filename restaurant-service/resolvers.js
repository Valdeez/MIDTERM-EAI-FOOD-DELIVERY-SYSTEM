// Helper untuk mengubah query MySQL menjadi Promise agar rapi dengan async/await
const mysql = require("mysql2/promise");

// Koneksi database langsung diletakkan di sini
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_restaurant",
});

const queryPromise = (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const createResolvers = (db) => {
  return {
    // PEMANFAATAN STRUKTUR PETA UNTUK OPERASI READ
    Query: {
      restaurants: async (_, { search }) => {
        try {
          let sql = "SELECT * FROM restaurants";
          let params = [];
          if (search) {
            sql += " WHERE name LIKE ?";
            params.push(`%${search}%`);
          }
          const results = await queryPromise(db, sql, params);
          return { message: "Berhasil mengambil data restoran", data: results };
        } catch (err) {
          throw new Error(`Gagal mengambil data restoran: ${err.message}`);
        }
      },

      restaurantDetail: async (_, { id }) => {
        try {
          const results = await queryPromise(
            db,
            "SELECT * FROM restaurants WHERE id = ?",
            [id],
          );
          if (results.length === 0) throw new Error("Restoran tidak ditemukan");
          return {
            message: "Berhasil mengambil detail restoran",
            data: results[0],
          };
        } catch (err) {
          throw new Error(err.message);
        }
      },

      menuDetail: async (_, { restaurant_id }) => {
        try {
          const results = await queryPromise(
            db,
            "SELECT * FROM menus WHERE restaurant_id = ?",
            [restaurant_id],
          );
          return { message: "Berhasil mengambil menu", data: results };
        } catch (err) {
          throw new Error(`Gagal mengambil menu: ${err.message}`);
        }
      },
    },

    // PEMANFAATAN STRUKTUR PETA UNTUK OPERASI WRITE/EDIT/DELETE
    Mutation: {
      createRestaurant: async (_, args) => {
        try {
          const {
            name,
            address,
            is_active,
            deskripsi,
            jam_operasional,
            rating,
            image,
          } = args;
          const isActiveVal = is_active !== undefined ? is_active : true;

          const results = await queryPromise(
            db,
            "INSERT INTO restaurants (name, address, is_active, image, deskripsi, jam_operasional, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              name,
              address,
              isActiveVal,
              image || null,
              deskripsi || null,
              jam_operasional || null,
              rating || null,
            ],
          );
          return {
            message: "Restoran berhasil ditambahkan",
            id: results.insertId,
            imageUrl: image,
          };
        } catch (err) {
          throw new Error(`Gagal menambahkan restoran: ${err.message}`);
        }
      },

      updateRestaurant: async (_, args) => {
        try {
          const {
            id,
            name,
            address,
            deskripsi,
            jam_operasional,
            is_active,
            crew_restaurant_id,
            image,
          } = args;

          if (parseInt(crew_restaurant_id) !== parseInt(id)) {
            throw new Error(
              "Akses ditolak: Anda hanya dapat mengedit restoran Anda sendiri.",
            );
          }

          let sql =
            "UPDATE restaurants SET name=?, address=?, deskripsi=?, jam_operasional=?, is_active=? WHERE id=?";
          let params = [
            name,
            address,
            deskripsi,
            jam_operasional,
            is_active,
            id,
          ];

          if (image) {
            sql =
              "UPDATE restaurants SET name=?, address=?, deskripsi=?, jam_operasional=?, is_active=?, image=? WHERE id=?";
            params = [
              name,
              address,
              deskripsi,
              jam_operasional,
              is_active,
              image,
              id,
            ];
          }

          await queryPromise(db, sql, params);
          return { message: "Detail restoran berhasil diperbarui" };
        } catch (err) {
          throw new Error(err.message);
        }
      },

      createMenu: async (_, args) => {
        try {
          const {
            restaurant_id,
            name,
            price,
            description,
            crew_restaurant_id,
            image,
          } = args;

          if (parseInt(crew_restaurant_id) !== parseInt(restaurant_id)) {
            throw new Error(
              "Akses ditolak: Tidak dapat menambah menu di restoran lain.",
            );
          }

          const results = await queryPromise(
            db,
            "INSERT INTO menus (restaurant_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)",
            [restaurant_id, name, price, description, image || null],
          );
          return { message: "Menu berhasil ditambahkan", id: results.insertId };
        } catch (err) {
          throw new Error(err.message);
        }
      },

      updateMenu: async (_, args) => {
        try {
          const { id, name, price, description, crew_restaurant_id, image } =
            args;

          let sql =
            "UPDATE menus SET name = ?, price = ?, description = ? WHERE id = ? AND restaurant_id = ?";
          let params = [name, price, description, id, crew_restaurant_id];

          if (image) {
            sql =
              "UPDATE menus SET name = ?, price = ?, description = ?, image = ? WHERE id = ? AND restaurant_id = ?";
            params = [name, price, description, image, id, crew_restaurant_id];
          }

          const results = await queryPromise(db, sql, params);
          if (results.affectedRows === 0) {
            throw new Error("Akses ditolak atau menu tidak ditemukan");
          }
          return { message: "Menu berhasil diupdate" };
        } catch (err) {
          throw new Error(err.message);
        }
      },

      deleteMenu: async (_, { id, crew_restaurant_id }) => {
        try {
          const results = await queryPromise(
            db,
            "DELETE FROM menus WHERE id = ? AND restaurant_id = ?",
            [id, crew_restaurant_id],
          );
          if (results.affectedRows === 0) {
            throw new Error("Akses ditolak atau menu tidak ditemukan");
          }
          return { message: "Menu berhasil dihapus" };
        } catch (err) {
          throw new Error(err.message);
        }
      },
    },
  };
};

module.exports = createResolvers;
