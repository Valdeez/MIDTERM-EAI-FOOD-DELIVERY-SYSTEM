const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Restaurant {
    id: ID!
    name: String!
    address: String!
    is_active: Boolean
    image: String
    deskripsi: String
    jam_operasional: String
    rating: Float
    menus: [Menu]
  }

  type Menu {
    id: ID!
    restaurant_id: ID!
    name: String!
    price: Int!
    description: String
    image: String
  }

  type RestaurantResponse {
    message: String
    data: [Restaurant]
  }

  type RestaurantDetailResponse {
    message: String
    data: Restaurant
  }

  type MenuResponse {
    message: String
    data: [Menu]
  }

  type MutationResponse {
    message: String!
    id: ID
    imageUrl: String
  }

  type Query {
    restaurants(search: String): RestaurantResponse
    restaurantDetail(id: ID!): RestaurantDetailResponse
    menuDetail(restaurant_id: ID!): MenuResponse
  }

  type Mutation {
    createRestaurant(
      name: String!
      address: String!
      is_active: Boolean
      deskripsi: String
      jam_operasional: String
      rating: Float
      image: String
    ): MutationResponse

    updateRestaurant(
      id: ID!
      name: String!
      address: String!
      deskripsi: String
      jam_operasional: String
      is_active: Boolean!
      crew_restaurant_id: ID!
      image: String
    ): MutationResponse

    createMenu(
      restaurant_id: ID!
      name: String!
      price: Int!
      description: String
      crew_restaurant_id: ID!
      image: String
    ): MutationResponse

    updateMenu(
      id: ID!
      name: String!
      price: Int!
      description: String
      crew_restaurant_id: ID!
      image: String
    ): MutationResponse

    deleteMenu(
      id: ID!
      crew_restaurant_id: ID!
    ): MutationResponse
  }
`);

module.exports = schema;