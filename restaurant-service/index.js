const express = require("express");
const cors = require("cors");
const path = require("path");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const { buildSubgraphSchema } = require("@apollo/subgraph");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

async function startServer() {
  const app = express();

  app.use("/public", express.static(path.join(__dirname, "public")));

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  await server.start();

  app.use("/", cors(), express.json(), expressMiddleware(server));

  app.listen(3001, () => {
    console.log(
      `🚀 Restaurant Subgraph (GraphQL) berjalan di http://localhost:3001`,
    );
    console.log(`🖼️ Akses gambar tersedia di http://localhost:3001/public/...`);
  });
}

startServer();
