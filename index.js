const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

//db
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jk76k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("shavershop");
    const product_collection = database.collection("products");
    const Purchase_info_collection = database.collection("Purchase_info");
    const Message_collection = database.collection("Message");
    const comment_collection = database.collection("comment");
	const usersCollection = database.collection('users');

    //get all api
    app.get("/products", async (req, res) => {
      const result = await product_collection.find({}).toArray();
      res.send(result);
    });
    //delete data 
    app.delete("/dataDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await product_collection.deleteOne(query);
      res.json(result)
    })
    //post in all api
    app.post("/addproduct", async (req, res) => {
      const doc = req.body;
      const result = await product_collection.insertOne(doc);
      res.json(result);
    });
    //get one Product_Collecton
    app.get("/productCollecton/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await product_collection.findOne(query);
      res.send(result);
    });
    //post on data
    app.post("/purchaseInfo", async (req, res) => {
      const result = await Purchase_info_collection.insertOne(req.body);
      res.json(result);
    });
    //post  message
    app.post("/message", async (req, res) => {
      const result = await Message_collection.insertOne(req.body);
      res.json(result);
    });
    //post  comment
    app.post("/comment", async (req, res) => {
      const result = await comment_collection.insertOne(req.body);
      res.json(result);
    });
    //get comment
    app.get('/comments', async (req, res) => {
      const result = await comment_collection.find({}).toArray();
      res.json(result)
    })

    //delete data 
    app.delete("/commentDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await comment_collection.deleteOne(query);
      res.json(result)
    })

    //get purchase api
    app.get("/purchaseInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await Purchase_info_collection.find(query).toArray();
      res.send(result);
    });

    //get all purchase
    app.get("/purchaseInfo", async (req, res) => {
      const result = await Purchase_info_collection.find({}).toArray();
      res.send(result);
    });

    //delete purchase
    app.delete("/purchaseDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Purchase_info_collection.deleteOne(query);
      res.json(result);
    });

    //update status  api
    app.put("/status/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: update.status,
        },
      };
      const result = await Purchase_info_collection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
	
	 app.get('/users/:email', async (req,res) => {
            const email = req.params.email;
            const query = { email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);

        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        })
		
		 app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        })
		
		
		 app.post("/addUserInfo", async (req, res) => {
    console.log("req.body");
    const result = await usersCollection.insertOne(req.body);
    res.send(result);
    console.log(result);
  });
  //  make admin
		
		app.put("/makeAdmin", async (req, res) => {
    const filter = { email: req.body.email };
    const result = await usersCollection.find(filter).toArray();
    if (result) {
      const documents = await usersCollection.updateOne(filter, {
        $set: { role: "admin" },
      });
      console.log(documents);
    }
    // else {
    //   const role = "admin";
    //   const result3 = await usersCollection.insertOne(req.body.email, {
    //     role: role,
    //   });
    // }

    // console.log(result);
  });

  // check admin or not
  app.get("/checkAdmin/:email", async (req, res) => {
    const result = await usersCollection
      .find({ email: req.params.email })
      .toArray();
    console.log(result);
    res.send(result);
  });

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);












app.get("/", (req, res) => {
  res.send("Welcome to ShaverShop Server Site ..... ");
});

app.listen(port, () => {
  console.log("listening on port", port);
});
