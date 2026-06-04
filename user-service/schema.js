const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    role: String!
    restaurant_id: Int
  }

  type LoginResponse {
    message: String!
    data: User
  }

  type RegisterResponse {
    message: String!
    user_id: ID!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    register(name: String!, password: String!, role: String, restaurant_id: Int): RegisterResponse
    login(name: String!, password: String!): LoginResponse
  }
`;

module.exports = typeDefs;