const gql = require("graphql-tag");

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type Payment {
    id: ID
    order_id: Int!
    payment_method: String!
    va_number: String!
    amount: Int!
    status: String!
  }

  type Query {
    getPaymentById(order_id: Int!): Payment
    getPayments: [Payment]
  }

  type Mutation {
    createPayment(
      order_id: Int!
      payment_method: String!
      amount: Int!
    ): Payment
    updatePaymentStatus(order_id: Int!, status: String!): Payment
  }
`;

module.exports = typeDefs;
