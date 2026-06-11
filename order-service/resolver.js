// file: order-service/resolver.js
const mysql = require("mysql2/promise");

// Koneksi database langsung diletakkan di sini
const pool = mysql.createPool({
  host: "mysql-db",
  user: "root",
  password: "",
  database: "db_order",
});

const resolvers = {
  Query: {
    getOrders: async (_, args) => {
      let sql = "SELECT * FROM orders WHERE 1=1";
      let params = [];

      if (args.status) {
        sql += " AND status = ?";
        params.push(args.status);
      }
      if (args.user_id) {
        sql += " AND user_id = ?";
        params.push(args.user_id);
      }
      if (args.restaurant_id) {
        sql += " AND restaurant_id = ?";
        params.push(args.restaurant_id);
      }

      const [rows] = await pool.query(sql, params);
      return rows;
    },

    getOrderById: async (_, { id }) => {
      const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [
        id,
      ]);
      if (rows.length === 0) throw new Error("Pesanan tidak ditemukan");
      return rows[0];
    },

    getOrderItems: async (_, { order_id }) => {
      const [rows] = await pool.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order_id],
      );
      return rows;
    },
  },

  Mutation: {
    createOrder: async (_, { user_id, restaurant_id, total_amount }) => {
      const [result] = await pool.query(
        'INSERT INTO orders (user_id, restaurant_id, total_amount, status) VALUES (?, ?, ?, "Pending")',
        [user_id, restaurant_id, total_amount],
      );
      return {
        id: result.insertId,
        user_id,
        restaurant_id,
        total_amount,
        status: "Pending",
      };
    },

    updateOrderStatus: async (_, { id, status }) => {
      await pool.query("UPDATE orders SET status = ? WHERE id = ?", [
        status,
        id,
      ]);
      return "Status pesanan berhasil diperbarui";
    },

    approveOrder: async (_, { order_id, restaurant_id }) => {
      const [result] = await pool.query(
        'UPDATE orders SET status = "Diproses" WHERE id = ? AND restaurant_id = ?',
        [order_id, restaurant_id],
      );
      if (result.affectedRows === 0) {
        throw new Error(
          "Gagal approve: Pesanan tidak ditemukan atau bukan milik restoran kru ini",
        );
      }
      return `Pesanan ${order_id} sedang diproses oleh kru.`;
    },

    addOrderItem: async (_, { order_id, menu_id, qty, price }) => {
      const [result] = await pool.query(
        "INSERT INTO order_items (order_id, menu_id, qty, price) VALUES (?, ?, ?, ?)",
        [order_id, menu_id, qty, price],
      );
      return { id: result.insertId, order_id, menu_id, qty, price };
    },

    updateOrderItemQty: async (_, { id, qty }) => {
      if (qty < 1) throw new Error("Kuantitas (qty) tidak valid");
      const [result] = await pool.query(
        "UPDATE order_items SET qty = ? WHERE id = ?",
        [qty, id],
      );
      if (result.affectedRows === 0)
        throw new Error("Item tidak ditemukan di keranjang");
      return "Jumlah item berhasil diperbarui";
    },

    deleteOrderItem: async (_, { id }) => {
      const [result] = await pool.query(
        "DELETE FROM order_items WHERE id = ?",
        [id],
      );
      if (result.affectedRows === 0) throw new Error("Item tidak ditemukan");
      return "Item berhasil dihapus dari keranjang";
    },
  },
};

module.exports = resolvers;
