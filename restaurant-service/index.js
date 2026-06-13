const express = require("express");
const cors = require("cors");
const path = require("path");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const { buildSubgraphSchema } = require("@apollo/subgraph");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

async function startServer() {
  const app = express();

  app.use("/public", express.static(path.join(__dirname, "public")));

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  await server.start();

  app.post("/upload", cors(), upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada gambar yang diunggah" });
    }
    res.json({ filePath: `/public/uploads/${req.file.filename}` });
  });

  app.use("/", cors(), express.json(), expressMiddleware(server));

  app.listen(3001, () => {
    console.log(
      `🚀 Restaurant Subgraph (GraphQL) berjalan di http://localhost:3001`,
    );
    console.log(`🖼️ Akses gambar tersedia di http://localhost:3001/public/...`);
  });
}

startServer();
