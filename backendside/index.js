const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

bodyParser = require("body-parser");
const app = express();

app.use(cors());

dotenv.config();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  res.json({
    message: "Success is the only option",
  });
});

const signupRoute = require("./routes/signupRoute");
const loginRoute = require("./routes/loginRoute");
const verifyOTPRoute = require("./routes/verifyOTP");

// Use route files
app.use(loginRoute);
app.use(signupRoute);
app.use(verifyOTPRoute);

app.use((req, res, next) => {
  const err = new Error("Something went wrong");
  err.status = 404;
  next(err);
});

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// *** Connection with Database ***
app.listen(5000, () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log(`Example app listening on port 5000`);
    })
    .catch((error) => {
      console.log("connection Failed :- ", error);
    });
});
