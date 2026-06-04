const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");

// Import schema dan resolver modular yang sudah kita buat sebelumnya
const schema = require("./schema");
const createResolvers = require("./resolvers");

// --- Koneksi Database ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_restaurant",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to db_restaurant (MySQL)");
});

// Inisialisasi resolver dengan melemparkan koneksi database pool
const rootResolvers = createResolvers(db);

// --- Inisialisasi Apollo Server ---
// Apollo Server menggunakan 'typeDefs' untuk skema dan 'resolvers' untuk logika bisnis
const server = new ApolloServer({
  typeDefs: schema,
  resolvers: rootResolvers,
});

// Jalankan Apollo Server secara standalone
const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 3001 },
  });
  console.log(`Apollo Server running on: ${url}`);
};

startServer();