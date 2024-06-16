const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

// middleware
// const corsOptions = {
//   origin: ["http://localhost:5173", "https://a10-art-fusion.web.app"],
//   credentials: true,
//   optionSuccessStatus: 200,
// };
app.use(
  cors({
    origin: ["http://localhost:5173", "https://a10-art-fusion.web.app"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ArtFusion Server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gjqtths.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const itemsCollection = client.db("itemsDB").collection("items");

    app.post("/items", async (req, res) => {
      const newItem = req.body;
      const result = await itemsCollection.insertOne(newItem);
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.get("/items", async (req, res) => {
      const cursor = itemsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/myList/:email", async (req, res) => {
      const result = await itemsCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemsCollection.findOne(query);
      res.send(result);
    });

    app.get("/categories/:category", async (req, res) => {
      const result = await itemsCollection
        .find({ category: req.params.category })
        .toArray();
      res.send(result);
    });

    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updatedItem = req.body;
      const newItem = {
        $set: {
          itemName: updatedItem.itemName,
          stockStatus: updatedItem.stockStatus,
          category: updatedItem.category,
          customization: updatedItem.customization,
          photoURL: updatedItem.photoURL,
          price: updatedItem.price,
          processing_time: updatedItem.processing_time,
          rating: updatedItem.rating,
          description: updatedItem.description,
        },
      };
      const result = await itemsCollection.updateOne(filter, newItem);
      res.send(result);
    });

    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/items/customization/:value", async (req, res) => {
      const value = req.params;
      console.log(value);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`ArtFusion Server is running on port: ${port}`);
});
