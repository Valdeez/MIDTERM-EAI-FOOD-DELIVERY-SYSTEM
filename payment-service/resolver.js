const axios = require("axios");
const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: "mysql-db",
  user: "root",
  password: "",
  database: "db_payment",
});

const resolvers = {
  Query: {
    getPaymentById: async (_, { order_id }) => {
      const [rows] = await pool.query(
        "SELECT * FROM payments WHERE order_id = ?",
        [order_id],
      );
      if (rows.length === 0)
        throw new Error("Data pembayaran tidak ditemukan");
      return rows[0];
    },

    getPayments: async () => {
      const [rows] = await pool.query("SELECT * FROM payments");
      return rows;
    },
  },
  Mutation: {
    createPayment: async (_, { order_id, payment_method, amount }) => {
      const va_number =
        "88" + Math.floor(1000000000 + Math.random() * 9000000000);
      const status = "Unpaid";

      const [result] = await pool.query(
        "INSERT INTO payments (order_id, payment_method, va_number, amount, status) VALUES (?, ?, ?, ?, ?)",
        [order_id, payment_method, va_number, amount, status],
      );

      const [rows] = await pool.query(
        "SELECT * FROM payments WHERE id = ?",
        [result.insertId],
      );
      return rows[0];
    },
    updatePaymentStatus: async (_, { order_id, status }) => {
      await pool.query("UPDATE payments SET status = ? WHERE order_id = ?", [
        status,
        order_id,
      ]);
      if (status === "Paid") {
        try {
          await axios.put("http://order-service:3002/api/orders/status", {
            order_id,
            status: "Diproses",
          });
          console.log("Notifikasi ke Order Service berhasil.");
        } catch (error) {
          console.error("Gagal mengupdate Order Service:", error.message);
        }
      }
      const [rows] = await pool.query(
        "SELECT * FROM payments WHERE order_id = ?",
        [order_id],
      );
      return rows[0];
    },
  },
};
module.exports = resolvers;