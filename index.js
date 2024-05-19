const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
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


    const menuCollection = client.db('bistroDB').collection('menu')
    const reviewsCollection = client.db('bistroDB').collection('reviews')


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