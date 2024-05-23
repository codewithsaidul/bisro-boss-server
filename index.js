const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000

const app = express()

const corsOptions = {
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://sakunest-b052c.web.app",
    ],
    credentials: true,
    optionSuccessStatus: 200,
};

// MIddleWare
app.use(cors(corsOptions))
app.use(express.json())



// MongoDb Connection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lggjuua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {


    const usersCollection = client.db('bistroDB').collection('users')
    const menuCollection = client.db('bistroDB').collection('menu')
    const reviewsCollection = client.db('bistroDB').collection('reviews')
    const cartsCollection = client.db('bistroDB').collection('carts')



    // Users Collection

    app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })



    // Post User Data on DB
    app.post('/users', async(req, res) => {
      const user = req.body;

      const query = { email: user.email}
      const existingUser = await usersCollection.findOne(query);

      if(existingUser) {
        return res.send({message: "User Already Exist", insertedId: null})
      }

      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

    // Delete a User by Id
    app.delete('/users/:id', async(req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id)};
      const result = await usersCollection.deleteOne(query);
      res.send(result)
    })



    // Menu Collection
    // Get The All Menu Data From Database
    app.get('/menu', async(req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result)
    })

    // Get The All Testimonial Data From Database
    app.get('/reviews', async(req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result)
    })



    // Cart Item Data

    app.get('/carts', async(req, res) => {
      const email = req.query.email;
      const query = { email: email}
      const result = await cartsCollection.find(query).toArray();
      res.send(result)
    })

    // Post The Cart item on db
    app.post('/carts', async(req, res) => {
      const cartItem = req.body;
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result)
    })

    // Delete Cart Item By Id
    app.delete('/carts/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await cartsCollection.deleteOne(query);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Saku Server is Running")
}) 

app.listen(port, () => {
    console.log(`Bistro Boss Server Running On POrt ${port}`)
})