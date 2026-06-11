// file: payment-service/index.js
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { buildSubgraphSchema } = require("@apollo/subgraph");

// Minta temanmu untuk memindahkan 'typeDefs gql`...`' ke file schema.js
const typeDefs = require("./schema");
const resolvers = require("./resolvers"); // Pastikan koneksi DB dipindah ke dalam file ini

async function startServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 3003 },
  });

  console.log(`🚀 Payment Subgraph berjalan di ${url}`);
}

startServer();
