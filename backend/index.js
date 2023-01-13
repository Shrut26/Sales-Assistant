const express = require("express");
const app = express();
const colors = require("colors");
var dotenv = require("dotenv");
const mongoDB = require("./config/db");
const User = require("./models/userModel");
const Product = require("./models/productModel");
const cors = require("cors");
const { findOne } = require("./models/userModel");
const Jwt = require("jsonwebtoken");
const jwtKey = "shrut";

dotenv.config();
mongoDB();

app.use(express.json());
app.use(cors());
app.post("/signup", async (req, res) => {
  if (
    req.body.name &&
    req.body.email &&
    req.body.password &&
    req.body.confirmPassword
  ) {
    const user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    // res.send(result);
    if (result) {
      Jwt.sign({ result }, jwtKey, { expiresIn: "24h" }, (err, token) => {
        if (err) {
          res.send("Unable to register");
        }
        res.send({ user, auth: token });
      });
    }
  } else {
    res.send("enter all");
  }
});

app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "24h" }, (err, token) => {
        if (err) {
          res.send("User not found");
        }
        res.send({ user, auth: token });
      });
    } else {
      res.send("User not found");
    }
  } else {
    res.send("Please fill all the crediatials");
  }
});

app.post("/add-product", verifyToken, async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(product);
});

app.get("/products", verifyToken, async (req, res) => {
  // console.warn(req.params.userID);
  // console.warn(req.body);
  let products = await Product.find(req.body);
  if (products) {
    res.send(products);
  } else {
    res.send("No product");
  }
});

app.get("/product/:id", verifyToken, async (req, res) => {
  let products = await Product.find({ userID: req.params.id });
  if (products) {
    res.send(products);
  } else {
    res.send("No product");
  }
});

app.delete("/delete-product/:id", verifyToken, async (req, res) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/products/:id", verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send("No record");
  }
});

app.put("/products/:id", verifyToken, async (req, res) => {
  let result = await Product.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/:id/search/:key", verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
    ],
    userID: req.params.id,
  });
  if (result) {
    res.send(result);
  } else {
    res.send("no found");
  }
});

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        res.status(401).send("Please add valid token with headers");
      } else {
        next();
      }
    });
  } else {
    res.status(403).send("Please add token with headers");
  }
}
app.listen(5000, console.log("Server is running at 5000 port"));
