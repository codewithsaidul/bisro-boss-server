const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

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
app.use(cors(corsOptions));
app.use(express.json());



// Verify Token MiddleWare
const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({ message: "Unathorized Access" });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unathorized Access" });
    }
    req.decoded = decoded;
    next();
  });
};

// MongoDb Connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lggjuua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    
    const usersCollection = client.db("bistroDB").collection("users");
    const menuCollection = client.db("bistroDB").collection("menu");
    const reviewsCollection = client.db("bistroDB").collection("reviews");
    const cartsCollection = client.db("bistroDB").collection("carts");



    // Admin Verify
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      next();
    };

    // JWT Related
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });

      res.send({ token });
    });

    // Users Collection

    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/user/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;

      if (user) {
        admin = user?.role === "admin";
      }

      res.send({ admin });
    });

    // Post User Data on DB
    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "User Already Exist", insertedId: null });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Admin Related
    app.patch(
      "/users/admin/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };

        const result = await usersCollection.updateOne(query, updateDoc);
        res.send(result);
      }
    );

    // Delete a User by Id
    app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Menu Collection======================================
    // Get The All Menu Data From Database
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });


    // Post Menu Data on the Database
    app.post('/menu', verifyToken, verifyAdmin, async(req, res) => {
      const item = req.body;
      const result = await menuCollection.insertOne(item)
      res.send(result)
    })

    app.delete('/menu/:id', verifyToken, verifyAdmin, async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await menuCollection.deleteOne(query);
      res.send(result)
    })

    // Get The All Testimonial Data From Database =========================
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // Cart Item Data ===========================================
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    // Post The Cart item on db
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result);
    });

    // Delete Cart Item By Id
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Saku Server is Running");
});

app.listen(port, () => {
  console.log(`Bistro Boss Server Running On POrt ${port}`);
});
