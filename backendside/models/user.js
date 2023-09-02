const mongoose = require("mongoose");

const user = mongoose.model("user", {
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
  },
  verified: Boolean,
});

module.exports = user;
