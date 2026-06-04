// file: user-service/index.js
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { buildSubgraphSchema } = require("@apollo/subgraph");

const typeDefs = require("./schema");
const resolvers = require("./resolvers"); // Pastikan koneksi pool dipindah ke dalam file ini

async function startServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 3004 },
  });

  console.log(`🚀 User Subgraph berjalan di ${url}`);
}

startServer();
