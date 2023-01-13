const mongoose = require("mongoose");

const productModel = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  company: {
    type: String,
  },

  userID: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Product", productModel);
module.exports = Product;
