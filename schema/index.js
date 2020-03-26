const mongoose = require('mongoose');
const { makeExecutableSchema } = require('graphql-tools');

const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');

const typeDefs = `
type User {
  _id: ID!
  email: String!
  orders: [Order]
}
type Product {
  _id: ID!
  name: String!
  description: String
  category: Category
}
type Category {
  _id: ID!
  name: String!
  products: [Product]
}
type Order {
  _id: ID!
  user: User
  products: [Product]
}
type Query {
  categories: [Category]
}
`;

const resolvers = {
  Query: {
    categories(_, __) {
      return Category.find({});
    }
  },
  User: {
    orders(parentValue, _) {
      return Orders.find({ user: parentValue._id });
    }
  },
  Category: {
    products(parentValue, _) {
      return Product.find({ category: parentValue._id });
    }
  },
  Product: {
    category: async (parentValue, _) => {
      const product = await parentValue.populate('category').execPopulate();
      return product.category;
    }
  },
  Order: {
    user: async (parentValue, _) => {
      const product = await parentValue.populate('user').execPopulate();
      return product.user;
    },
    products: async (parentValue, _) => {
      const product = await parentValue.populate('products').execPopulate();
      return product.products;
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = {
  schema,
  typeDefs,
  resolvers
}