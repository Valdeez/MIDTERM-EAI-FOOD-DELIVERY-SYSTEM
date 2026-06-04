// file: api-gateway/index.js
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      // { name: "restaurants", url: "http://localhost:3001" },
      { name: "orders", url: "http://localhost:3002" },
      // { name: "payments", url: "http://localhost:3003" },
      // { name: "users", url: "http://localhost:3004" },
    ],
  }),
});

async function startGateway() {
  const server = new ApolloServer({
    gateway,
  });

  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 3000 },
    });

    console.log(`🚀 API Gateway (Supergraph) berjalan di ${url}`);
  } catch (error) {
    console.error(
      "Gagal menyalakan API Gateway. Pastikan order-service di port 3002 sedang berjalan!",
      error.message,
    );
  }
}

startGateway();
