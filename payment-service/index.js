// index.js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { ApolloServerPluginLandingPageLocalDefault } = require('apollo-server-core');
const mysql = require('mysql2/promise');
const cors = require('cors');
const createResolvers = require('./resolvers'); // ✅ Import dari file terpisah

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_payment'
});

const typeDefs = gql`
    type Payment {
        id: ID
        order_id: Int!
        payment_method: String!
        va_number: String!
        amount: Int!
        status: String!
    }

    type Query {
        getPayment(order_id: Int!): Payment
    }

    type Mutation {
        createPayment(order_id: Int!, payment_method: String!, amount: Int!): Payment
        updatePaymentStatus(order_id: Int!, status: String!): Payment
    }
`;

async function startServer() {
    const app = express();
    app.use(cors());

    const server = new ApolloServer({
        typeDefs,
        resolvers: createResolvers(pool), // ✅ Pool dipass ke resolver
        introspection: true,
        plugins: [
            ApolloServerPluginLandingPageLocalDefault({ embed: true })
        ]
    });

    await server.start();

    server.applyMiddleware({
        app,
        path: '/graphql',
        cors: false
    });

    app.listen(3003, () => {
        console.log(`✅ Payment Service running at http://localhost:3003/graphql`);
    });
}

startServer().catch(err => {
    console.error('❌ Gagal start server:', err);
});