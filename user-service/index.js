const mysql = require('mysql2/promise');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const pool = mysql.createPool({ 
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'db_user' 
});

async function startServer() {
    const server = new ApolloServer({ typeDefs, resolvers });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 3004 },
        context: async () => ({ pool }) 
    });

    console.log(`User Service (Modular) berjalan lancar 🚀 di ${url}`);
}

startServer();