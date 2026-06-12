const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "mysql-db",
  user: "root",
  password: "",
  database: "db_restaurant",
}).promise();

const resolvers = {
  Query: {
    restaurants: async (_, { search }) => {
      let sql = "SELECT * FROM restaurants";
      let params = [];

      if (search) {
        sql += " WHERE name LIKE ?";
        params.push(`%${search}%`);
      }

      const [rows] = await pool.query(sql, params);

      return {
        message: "Berhasil mengambil data restoran",
        data: rows,
      };
    },

    restaurantDetail: async (_, { id }) => {
      const [rows] = await pool.query(
        "SELECT * FROM restaurants WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Restoran tidak ditemukan");
      }

      return {
        message: "Berhasil mengambil detail restoran",
        data: rows[0],
      };
    },

    menuDetail: async (_, { restaurant_id }) => {
      const [rows] = await pool.query(
        "SELECT * FROM menus WHERE restaurant_id = ?",
        [restaurant_id]
      );

      return {
        message: "Berhasil mengambil menu",
        data: rows,
      };
    },
  },

  Mutation: {
    createRestaurant: async (_, args) => {
      const {
        name,
        address,
        is_active,
        deskripsi,
        jam_operasional,
        rating,
        image,
      } = args;

      const [result] = await pool.query(
        `INSERT INTO restaurants
        (name, address, is_active, image, deskripsi, jam_operasional, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          address,
          is_active ?? true,
          image || null,
          deskripsi || null,
          jam_operasional || null,
          rating || null,
        ]
      );

      return {
        message: "Restoran berhasil ditambahkan",
        id: result.insertId,
        imageUrl: image,
      };
    },

    updateRestaurant: async (_, args) => {
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
          "Akses ditolak: Anda hanya dapat mengedit restoran Anda sendiri."
        );
      }

      if (image) {
        await pool.query(
            `UPDATE restaurants
            SET name=?, address=?, deskripsi=?, jam_operasional=?,
                is_active=?, image=?
            WHERE id=?`,
          [
            name,
            address,
            deskripsi,
            jam_operasional,
            is_active,
            image,
            id,
          ]
        );
      } else {
        await pool.query(
            `UPDATE restaurants
            SET name=?, address=?, deskripsi=?,
                jam_operasional=?, is_active=?
            WHERE id=?`,
          [
            name,
            address,
            deskripsi,
            jam_operasional,
            is_active,
            id,
          ]
        );
      }

      return {
        message: "Detail restoran berhasil diperbarui",
      };
    },

    createMenu: async (_, args) => {
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
          "Akses ditolak: Tidak dapat menambah menu di restoran lain."
        );
      }

      const [result] = await pool.query(
        `INSERT INTO menus
        (restaurant_id, name, price, description, image)
        VALUES (?, ?, ?, ?, ?)`,
        [restaurant_id, name, price, description, image || null]
      );

      return {
        message: "Menu berhasil ditambahkan",
        id: result.insertId,
      };
    },

    updateMenu: async (_, args) => {
      const {
        id,
        name,
        price,
        description,
        crew_restaurant_id,
        image,
      } = args;

      let result;

      if (image) {
        [result] = await pool.query(
            `UPDATE menus
            SET name=?, price=?, description=?, image=?
            WHERE id=? AND restaurant_id=?`,
          [name, price, description, image, id, crew_restaurant_id]
        );
      } else {
        [result] = await pool.query(
            `UPDATE menus
            SET name=?, price=?, description=?
            WHERE id=? AND restaurant_id=?`,
          [name, price, description, id, crew_restaurant_id]
        );
      }

      if (result.affectedRows === 0) {
        throw new Error("Akses ditolak atau menu tidak ditemukan");
      }

      return {
        message: "Menu berhasil diupdate",
      };
    },

    deleteMenu: async (_, { id, crew_restaurant_id }) => {
      const [result] = await pool.query(
        "DELETE FROM menus WHERE id = ? AND restaurant_id = ?",
        [id, crew_restaurant_id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Akses ditolak atau menu tidak ditemukan");
      }

      return {
        message: "Menu berhasil dihapus",
      };
    },
  },
};

module.exports = resolvers;