// file: order-service/schema.js
const gql = require("graphql-tag");

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type Order @key(fields: "id") {
    id: ID!
    user_id: Int!
    restaurant_id: Int!
    total_amount: Float!
    status: String!
  }

  type OrderItem @key(fields: "id") {
    id: ID!
    order_id: Int!
    menu_id: Int!
    qty: Int!
    price: Float!
  }

  type Query {
    getOrders(status: String, user_id: Int, restaurant_id: Int): [Order]
    getOrderById(id: ID!): Order
    getOrderItems(order_id: Int!): [OrderItem]
  }

  type Mutation {
    createOrder(user_id: Int!, restaurant_id: Int!, total_amount: Float!): Order
    updateOrderStatus(id: ID!, status: String!): String
    addOrderItem(
      order_id: Int!
      menu_id: Int!
      qty: Int!
      price: Float!
    ): OrderItem
  }
`;

module.exports = typeDefs;
