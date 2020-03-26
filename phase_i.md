# Phase I

## Express and MongoDB Setup

Before we add GraphQL, we need to first set up our Express server and Mongo database. This will be mostly review.

### Install Dependencies

Make a folder called `online-store-part-1`.

Inside of that folder, run `npm init --y` to create your `package.json` file.

Let's install the following packages using `npm install`:

- express
- mongoose

Take a look at your `package.json` file. You will notice that the dependencies have been added to this file and that a `node_modules` folder has been created.

Make sure to `.gitignore` the `node_modules` folder by creating a `.gitignore` file at the root of your directory and add the line, `node_modules/` to it.

Let's also install the following development packages using `npm install -D`:

- nodemon

### Creating the Express Server

Create a file in your root directory called `index.js`. Within the `index.js` file, let's create a new Express server with a test route to see if our server is working properly.

```javascript
// index.js
const express = require('express');
const app = express();

app.get('/hello', (req, res) => res.send('Hello World!'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
```

Let's define a script on our `package.json` to start our server.

```json
  "scripts": {
    "start": "node index.js",
    "server:dev": "nodemon --inspect index.js"
  }
```

In your terminal now, run `npm run server:dev`. Any changes that you save to your files should restart your server.
Open up [localhost:5000/hello](localhost:5000/hello) to see your test route. You should see the text "Hello World!".

### MongoDB Setup

Let's set up the MongoDB now.

#### 1. Set Up the Database

If you already have a Mongo URI connection string to a database, then you can skip this step.

We will be using [MongoDB Atlas], which is a free service (at the basic tier) allowing us to host our database online. Follow these steps to setup your database:

- Go to the website and create an account
- Click Build a cluster
- Select Amazon Web Services as your cloud provider
- Choose N Virginia `US-East-1` as your region
- Leave everything else as defaults
- Wait for the cluster to be created (7-10 min)
- Click the `Connect` button on the newly created cluster
- Click `Add a different IP address` and enter `0.0.0.0/0` to allow connections from any IP
- Next create a new user
- Give them whatever username you like I.E. `dev`
  _ Click the `Autogenerate Secure Password` button and save the password for later
  _ DO NOT COMMIT THE PASSWORD
- Click chose a connection method
- Click `Connect Your Application`
- Copy and paste the connection string
- replace the `<username>` with the username we just created
- replace the `<password>` with the auto-generated password
- now that we have this connection string we want to save it somewhere it won’t be committed

#### 2. Connect to our MongoDB

Use the Mongo URI connection string you identified in the last step (it looks something like `mongodb+srv://<DBUser>:<password>@cluster.mongodb.net/<DBname>?retryWrites=true&w=majority`). I suggest making the `<DBname>` called `online-store`.

- Create a new directory named 'config'
- Make a new file within that directory called `keys.js`
- Add the following code to `keys.js`:

```JavaScript
module.exports = {
  mongoURI: 'mongodb+srv://<DBUser>:<password>@cluster.mongodb.net/<DBname>?retryWrites=true&w=majority'
};
```

- Make sure to replace `dbuser` and `dbpassword` with the username and password you created during the Atlas setup.
- **Important:** `.gitignore` the config directory before you make another commit. You don't want to push your private username and password to GitHub, and it will be difficult to roll back later.

`.gitignore should now look like:
```
node_modules/
config/keys.js
```

- Head back to `index.js`. At the top of the file, import Mongoose: `const mongoose = require('mongoose');`
- On the line after the one where you instantiated `app`, import your key by typing `const db = require('./config/keys').mongoURI;`
- Now, we can connect to MongoDB using Mongoose:

```JavaScript
const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));
```

As long as you have followed the above steps successfully and entered the correct username and password, you should see your success message in the console when you start up your sever. That's it! Mongoose is up and running.

## Mongoose Models and Schemas

Let's make the mongoose models and schemas for our online store. We will have `User`, `Category`, `Product`, and `Order` models.

- User
    - email - String, required, unique
    - password - String, required
    - timestamps
- Category
    - name - String, required, unique
- Product
    - name - String, required, unique
    - description - String
    - price - Number, required
    - category - ObjectId referencing Category
- Order
    - user - ObjectId referencing User
    - products - an array of ObjectId's referencing Product
    - timestamps

An `Order` will hold information on what products a user has bought in a single order.

Create a new folder called `models`. By convention, model files in mongoose are **singular**, **title-cased**, and **camel-cased**.

Go ahead and create the models and schemas based on the above information. If you need help, see below.

### User Model

Let's create the `User` model. First we need to define the `UserSchema`. Require `'mongoose'` at the top of the file and initialize a new `Schema` from `mongoose.Schema` and pass in the following two objects.

```javascript
// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
```

The `unique: true` option on the `email` property will create a Mongo index and create a database level validation. (Note: this validation will only work when there are no duplicates present in your current database.)

Let's export the model from the defined schema at the bottom of the file and call the model, `User`. This will create a `users` collection in our database and save users into it with the fields defined on the schema.

```javascript
module.exports = mongoose.model('User', UserSchema);
```

### Category Model

Let's create the `Category` model. First we need to define the `CategorySchema`. Require `'mongoose'` at the top of the file and initialize a new `Schema` from `mongoose.Schema` and pass in the following object.

```javascript
// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});
```

Let's export the model from the defined schema at the bottom of the file and call the model, `Category`. 

```javascript
module.exports = mongoose.model('Category', CategorySchema);
```

### Product Model

Let's create the `Product` model. First we need to define the `ProductSchema`. Require `'mongoose'` at the top of the file and initialize a new `Schema` from `mongoose.Schema` and pass in the following object.

```javascript
// models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }
});
```

A `Product` will have a single `Category` and will store the category's `ObjectId` on the `category` property.

Let's export the model from the defined schema at the bottom of the file and call the model, `Product`. 

```javascript
module.exports = mongoose.model('Product', ProductSchema);
```

### Order Model

Let's create the `Order` model. First we need to define the `OrderSchema`. Require `'mongoose'` at the top of the file and initialize a new `Schema` from `mongoose.Schema` and pass in the following object.

```javascript
// models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});
```

An `Order` will have a single `User` and will store the user's `ObjectId` on the `user` property.
An `Order` will have multiple `Product`s stored as an array of product `ObjectId`'s on the `products` property.

We could have defined the orders on a `User`, BUT the reason why we choose not to is because a `User` has the possiblity of making hundreds of orders. If we nest the orders underneath the `user` document, the `user` document would become way too big. It's safer to define orders as their own entities in our database because documents will not become overly bloated. This same reason applies to why we don't store all the `products` of a `category` on the `category` document itself.

Let's export the model from the defined schema at the bottom of the file and call the model, `Order`. 

```javascript
module.exports = mongoose.model('Order', OrderSchema);
```

## Wrapping up Mongoose

Let's now import all of our models into our server entry file, `index.js`.

First, we need to make another file called `index.js` in our `models/` folder. There, we will require all of the models we want to use in our database.

```javascript
// models/index.js
require('./User');
require('./Category');
require('./Product');
require('./Order');
```

Next, we are going to require this file in our server entry file, `index.js`, after we require mongoose:

```javascript
// index.js
const mongoose = require('mongoose');
require('./models');
// ..rest of index.js
```

This allows us to load all the models into mongoose so every time we want to gain access to a specific model, we don't have to import the model file itself. Notice how we didn't need to say `'./models/index.js'`. That's because node is smart enough to look for a file named `index.js` in the folder of `./models`. (Careful of not having a file named `'./models.js'` for this to work as expected.)

```javascript
const User = mongoose.model('User');
```

You'll notice that when you run the server, there are certain deprecation warnings. To get rid of those warnings, let's change how we connect to the mongo database:

```javascript
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err));
```

We need to specify `useCreateIndex` as `true` because we indicated that we want a database level uniqueness validation on some schemas. If you want to know more about the deprecation warnings, check these docs out: [Mongoose Deprecation Warnings]

Awesome!! We just finished setting up our Express server and our mongo database! Let's move on to the fun stuff, integrating GraphQL as a layer between our Express server and our database.

[MongoDB Atlas]: https://www.mongodb.com/cloud/atlas?jmp=docs
[Mongoose Deprecation Warnings]: https://mongoosejs.com/docs/deprecations.html