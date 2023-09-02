const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const UserOTPVerification = require("../models/UserOTPVerification");
const nodemailer = require("nodemailer");

router.post("/verifyOTP", async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      throw new Error("Emtpy otp details are not allowes");
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({
        userId,
      });
      if (UserOTPVerificationRecords.length <= 0) {
        throw new Error(
          "Account record doesn't exist or has been verified already. Please signup or login..."
        );
      } else {
        // user otp Exists
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;
        if (expiresAt < Date.now()) {
          await UserOTPVerification.deleteMany({ userId });
          throw new Error("Otp has expired. Please request again");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            throw new Error("Invalid code Passed. Check your Inbox Again.");
          } else {
            await user.updateOne({ _id: userId }, { verified: true });
            await UserOTPVerification.deleteMany({ userId });
            res.json({
              status: "VERIFIED",
              message: "Email verified Succesfully.",
            });
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});

module.exports = router;
