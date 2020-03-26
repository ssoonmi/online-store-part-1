# Phase II

## GraphQL Setup

Let's setup GraphQL to integrate with our Express server.

### Install Dependencies

Let's install the following packages using `npm install`:

- express-graphql
- graphql
- graphql-tools
- fakergem - for seeding our database

Let's also install the following development packages using `npm install -D`:

- graphql-playground-middleware-express - GraphQL Playground IDE

### Connecting GraphQL to Express

Let's import `graphqlHTTP` from `express-graphql` and `expressPlayground` from `graphql-playground-middleware-express` at the top of our server entry file, `index.js`.

```javascript
// top of index.js
const graphqlHTTP = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
```

After you define `app`, we are going to connect the `graphqlHTTP` middleware to the `/graphql` route and connect the `expressPlayground` middleware to the `/playground` route with the `endpoint` option set to `/graphql`.

```javascript
// index.js, after you define app
app.use(
  '/graphql',
  graphqlHTTP({
    // options
  })
);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
```

`/graphql` is the route at which we can make GraphQL queries and mutations. `/playground` is the route at which we can access our GraphQL IDE and test out the queries and mutations.

`graphqlHTTP` has its own build-in GraphQL IDE called `GraphiQL` that you can turn on, but it's just not as good as GraphQL Playground. For more information on the built-in IDE, check out [How to Set Up GraphiQL].

If you head to [localhost:5000/playground](localhost:5000/playground), you'll see an error message pop up on the right window. 
If you head to [localhost:5000/graphql](localhost:5000/graphql), you'll see a more detailed error saying that GraphQL needs a schema.

### Seeding the Database

Let's seed our database. Go over to this [seed file]. Copy the contents and paste it in a file called `seeds.js` in your root directory. Then run `node seeds.js` in your terminal.

Great! We just finished setting up GraphQL on Express. Now we can move on to the fun stuff, GraphQL.

## GraphQL Type Definitions

We need to define what we want our GraphQL Types to return. 

Let's create a folder called `schema` in the root directory and add an `index.js` file in there. To define type definitions, we are going to define a variable called `typeDefs` and it will be set to a [template literal] that is a string that uses backticks, `, instead of quotation marks.

```javascript
const typeDefs = `
`;
```

We will nest our type definitions in those backticks.

Based on our Mongoose model schemas, we can come up with a general idea of how some of our GraphQL Object Types should look like.

Starting with the `User` model, our `User` schema includes `email` as a String, and `password` as properties. We don't need to ever return the `password` from a `User` type so we will not include it in our type defintions. A `user` can also have many `order`s. So we will also include an `orders` field in our `User` type with a value of `Order` type.

All our MongoDB documents will have an `_id`, so we will make that a non-nullable field with the value of type `ID`. 

```graphql
type User {
  _id: ID!
  email: String!
  orders: [Order]
}
```

We add the type of `User` to our `typeDefs` like so:

```javascript
const typeDefs = `
type User {
  _id: ID!
  email: String!
  orders: [Order]
}
`;
```

**Try to come up with the `Category`, `Product`, and `Order` type definitions without looking below first. If you get stuck, please ask a question.**

```graphql
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
```

Nice! Let's now define a field on the `Query` type.

```graphql
type Query {
  categories: [Category]
}
```

This will fetch all the `categories`.

We will write more queries and define the `Mutation` type later. For now, let's try and get this query to work.

## GraphQL Resolvers

Now, we need to define our GraphQL resolvers. Let's define our `Query` resolvers in a variable on our `schema/index.js` file called `resolvers` and set it to an object with a key of Query set to another object. That inner object should have the same name as the `Query` field we just created, `categories` and have a value be a function that returns all the categories in our database.

```javascript
// schema/index.js at the top of the file
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');

// after type defs
const resolvers = {
  Query: {
    categories(_, __) {
      return Category.find({});
    }
  }
};
```

The first argument to a resolver is the parentValue, but since a query is the first node in the graph we are building, we don't need this value so we just define it as `_`. The second argument to a resolver is the arguments of the query. The `categories` query also doesn't take any arguments so we indicate that we don't need it with double underscores, `__`.

Now, let's define resolvers for our Object Types. We only need to define Object Type resolvers for fields that the Query or Mutation don't return or don't return in the right format. 

**Try to come up with the resolvers for each of the Object Types. If you get stuck, please ask a question.**

You should end up with resolvers looking like this:

```javascript
const resolvers = {
  // ... Query resolvers
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
```

## Connecting our GraphQL Schema

Awesome! Now that we made our resolvers, let's make our schema! Import `makeExecutableSchema` from `graphql-tools` at the top of the file. Let's call `makeExecutableSchema` at the end of the file and invoke it with an object with the key of `typeDefs` and the value of `typeDefs` variable and a key of `resolvers` and the value of `resolvers` variable.

```javascript
// schema/index.js top of file
const { makeExecutableSchema } = require('graphql-tools');

// end of file
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})
```

Now let's export the schema, resolvers, and typeDefs at the end of this file.

```javascript
// schema/index.js end of file
module.exports = {
  schema,
  typeDefs,
  resolvers
}
```

In our server entry file, let's import the `schema` and `resolvers` (make sure to do this sometime after you import the Mongoose models into the entry file) and include them in our `graphqlHTTP` middleware as options.

```javascript
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers
  })
);
```

Start your server and try reloading Playground at [localhost:5000/playground](localhost:5000/playground) and query for all the `categories`. Make sure to check the `"DOCS"` and `"SCHEMA"` tabs on the right of Playground to see if you set up your types correctly.

## More Queries

On your own, try making the following queries with proper arguments:

- category
- products
- product
- orders
- order

Make sure to add the appropriate type definitions and appropriate resolvers for each. Reference the [Formulating Queries and Mutations] reading if you need help.

Make sure to test it out in Playground and try using `Query Variables`!

## Mutations

Let's try creating a mutation for signing up a user. Authenticating users are not going to be covered today, so we will store a user's email and password directly into the database for now.

Just like how we define the `Query` type, we are going to define a `Mutation` type with a field called `signup` that returns a `User` type.

In our `typeDefs` template literal in our `schema/index.js` file, we are going to add the `signup` mutation.

**Try doing this yourself using the `User` schema as a reference before looking below**

```graphql
type Mutation {
  signup(email: String, password): User
}
```

If your `Mutation` type looks like this, then great job!

Now we need to make the resolver for this `mutation` field.

Let's create a key in our `resolvers` called `Mutation` whose value will be an object with the `signup` key's value as a resolver function. We will be saving the email and password directly into the `users` collection and returning a `User`.

**Try this on your own before looking below.**

Your `resolvers` object should now look like:

```javascript
const resolvers = {
  // ... Query resolvers
  // ... Object Type resolvers
  Mutation: {
    signup(_, { email, password }) {
      const newUser = new User({ email, password });
      return newUser.save();
    }
  }
}
```

Just like a resolver function on the `Query` type, our `Mutation` type resolvers don't care about the first argument to the resolver, the `parentValue`. The `signup` mutation takes in `email` and `password` as inputs so we can extract them from the second argument to the resolver, the `arguments`. 

Woot! We created our first mutation!

## More Mutations

Let's get funky and try creating our own mutations for the following:

- createProduct
- createCategory
- deleteProduct
- deleteCategory
- updateProductCategory

Make sure to add the appropriate arguments, type definitions, resolver functions for each. Reference the [Formulating Queries and Mutations] reading if you need help.

Make sure to test it out in Playground and try using `Query Variables`!

## Conclusion

Hopefully, now you are more aquainted with how to make queries and mutations in our server. 

We learned how to make a GraphQL schema using type definitions and resolvers.

We also learned how to connect our GraphQL schema to Express and test out our queries and mutations.

If you want to challenge yourselves and come up with more queries and mutations to implement, go ahead!

[How to Set Up GraphiQL]: https://graphql.org/graphql-js/running-an-express-graphql-server/
[seed file]: /seeds.js
[template literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
[Formulating Queries and Mutations]: https://github.com/ssoonmi/mern-graphql-curriculum/blob/master/formulating_queries_and_mutations.md