const mongoose = require("mongoose");

const product = mongoose.model("product", {
  companyName: {
    type: String,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  comments: {
    type: Array,
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    required: true,
  },
  productLink: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
});

module.exports = product;
