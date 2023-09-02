const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const UserOTPVerification = require("../models/UserOTPVerification");
const nodemailer = require("nodemailer");

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString(); // Convert it to a string
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

dotenv.config();
router.post("/signup", bodyParser.json(), async (req, res) => {
  const { email, password } = req.body;

  //  email format validation
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // password minimum length validation
  if (password.length < 5) {
    return res
      .status(400)
      .json({ message: "Password must be at least 5 characters long." });
  }

  try {
    const existingUser = await user.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await user.create({
      email: email,
      password: hashedPassword,
      verified: false,
    });
    // console.log(process.env.SECRET_KEY);
    // sendOTPVerificationEmail(result, res);
    const emailResult = await sendOTPVerificationEmail(result, res);
    // if (emailResult.status === "PENDING") {
    //   const token = jwt.sign(
    //     {
    //       email: result.email,
    //       id: result._id,
    //     },
    //     process.env.SECRET_KEY
    //   );
    //   return res.status(201).json({ user: result, token: token });
    // } else {
    //   return res
    //     .status(500)
    //     .json({ message: "Failed to send verification email" });
    // }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong !" });
  }
});

module.exports = router;

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const sixDigitOTP = generateOTP();
    let mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "OTP for verificaion",
      html: `<p><b>${sixDigitOTP}</b> use this otp for your account verification!</p>
      <p>This code <b>expires in 10 minutes</b></p>`,
    };

    // hashing the otp
    const saltrounds = 10;
    const hashedOTP = await bcrypt.hash(sixDigitOTP, saltrounds);

    const result = await UserOTPVerification.create({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent Succesfully", info);
      }
    });

    return res.json({
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    return res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

router.post("/resentOTPVerificationCode", async (req, res) => {
  try {
    let { userId, email } = req.body;
    if (!userId || !email) {
      throw new Error("Empty user details are not allowed.");
    } else {
      await UserOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);
    }
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
});
