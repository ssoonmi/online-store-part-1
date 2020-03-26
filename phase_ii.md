# Phase II

## GraphQL Setup

Let's setup GraphQL to integrate with our Express server.

### Install Dependencies

Let's install the following packages using `npm install`:

- express-graphql
- graphql
- graphql-tools

Let's also install the following development packages using `npm install -D`:

- graphql-playground-middleware-express - GraphQL Playground IDE

### Connecting GraphQL to Express

Let's import `graphQLHTTP` from `express-graphql` and `expressPlayground` from `graphql-playground-middleware-express` at the top of our server entry file, `index.js`.

```javascript
// top of index.js
const graphQLHTTP = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
```

After you define `app`, we are going to connect the `graphQLHTTP` middleware to the `/graphql` route and connect the `expressPlayground` middleware to the `/playground` route with the `endpoint` option set to `/graphql`.

```javascript
// index.js, after you define app
app.use(
  '/graphql',
  graphQLHTTP({
    // options
  })
);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
```

`/graphql` is the route at which we can make GraphQL queries and mutations. `/playground` is the route at which we can access our GraphQL IDE and test out the queries and mutations.

`graphQLHTTP` has its own build-in GraphQL IDE called `GraphiQL` that you can turn on, but it's just not as good as GraphQL Playground. For more information on the built-in IDE, check out [How to Set Up GraphiQL].

If you head to [localhost:5000/playground](localhost:5000/playground), you'll see an error message pop up on the right window. 
If you head to [localhost:5000/graphql](localhost:5000/graphql), you'll see a more detailed error saying that GraphQL needs a schema.

---------------- IN PROGRESS ------------------------

[How to Set Up GraphiQL]: https://graphql.org/graphql-js/running-an-express-graphql-server/