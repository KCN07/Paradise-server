const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9v9bb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run(){
   try{
      await client.connect();
      
      const database = client.db("paradise");
      const productsCollection = database.collection("products");
      const myPurchaseCollection = database.collection('myPurchase');
      const reviewsCollection = database.collection('reviews');
      const usersCollection = database.collection('users');
      
      app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
      });

      //MakeAdmin API
      app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        const filter = {email: user.email};
        const updateDoc = { $set:{role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })
      
      //Chechk admin API
      app.get('/users/:email', async(req, res)=>{
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
            isAdmin = true;
        }
        res.json({admin: isAdmin});
    })

      app.get("/products", async (req, res) => {
        // console.log(req.query);
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
      });
      
      //get products by id
      app.get("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await productsCollection.findOne(query);
        res.send(product);
      });

      // Add myPurchase API
    app.post("/myPurchase", async (req, res) => {
      const myPurchase = req.body;
      const result = await myPurchaseCollection.insertOne(myPurchase);
      res.json(result);
    });

    // Add products API
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });
    
   //GET all orders
    app.get("/orders", async (req, res) => {
      // console.log(req.query);
      const cursor = myPurchaseCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    
     //GET USER orders
     app.get('/myPurchase/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {email: email};
      const result = await myPurchaseCollection.find(query).toArray();
      res.send(result);
  });

  //DELETE order API
  app.delete("/myPurchase/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await productsCollection.deleteOne(query);

    // console.log("deleting user with id ", result);

    res.json(result);
  });

  //DELETE product API
  app.delete("/products/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await productsCollection.deleteOne(query);

    // console.log("deleting user with id ", result);

    res.json(result);
  });

  // Add review API
  app.post("/addReview", async (req, res) => {
    const myOrder = req.body;
    const result = await reviewsCollection.insertOne(myOrder);
    res.json(result);
  });

  app.get("/reviews", async (req, res) => {
    // console.log(req.query);
    const cursor = reviewsCollection.find({});
    const reviews = await cursor.toArray();
    res.send(reviews);
  });

  //UPDATE API
  app.put("/orders/:id", async(req, res)=>{
    const id = req.params.id;
    const updatedUser = req.body;
    const filter = {_id: ObjectId(id)};
    const options = { upsert: true };
    const updateDoc = {
        $set: {
          status: updatedUser.status
        },
      };
    const result = await myPurchaseCollection.updateOne(filter,updateDoc,options)
    // console.log('updating user', req);
    res.json(result);
})

   }
   finally{
    //   await client.close();
   }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello Paradise!')
})

app.listen(port, () => {
  console.log(` listening at ${port}`)
})