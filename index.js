const express = require('express');
const mongoose = require('mongoose');
require('./models');
const graphQLHTTP = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
const db = require('./config/keys').mongoURI

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err));

const app = express();

app.use(
  '/graphql',
  graphQLHTTP({
    // options
  })
);

app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

app.get('/hello', (req, res) => res.send('Hello World!'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));