const express = require("express");
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
const crypto = require('crypto');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
var nodemailer = require('nodemailer');
const helperMethod = require('./../utils/helperMethod');
const AUTHENTICATE = require('./../middleware/auth.middleware')


const BUCKET_NAME = process.env.BUCKET_NAME;

const BUCKET_REGION = process.env.BUCKET_REGION;

const ACCESS_KEY = process.env.ACCESS_KEY;

const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION
})


const router = express.Router();

const User = require("../Model/user");
const TokenModel = require("../Model/tokenModel")

router.post("/", async (req, res) => {
})

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const profilePicture = req.files[0]

    if (!(email && password && name && profilePicture)) {
      res.status(400).send("All input is required");
    }

    const imageName = generateFileName()

    const params = {
      Bucket: BUCKET_NAME,
      Key: imageName,
      Body: req.files[0].buffer,
      ContentType: req.files[0].mimetype
    }

    const command = new PutObjectCommand(params);

    await s3.send(command);

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageName
    });

    const url = await getSignedUrl(
      s3,
      getCommand);

    const oldUser = await User.findOne({ email });

    const imgURL = url.split("?")[0]

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    };

    var randomOtp = Math.floor(1000 + Math.random() * 9000);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ahsannawazcp@gmail.com',
        pass: 'hqnjcgnzlvrrufpm'
      }
    });

    send();

    async function send() {
      const result = await transporter.sendMail({
        from: 'ahsannawazcp@gmail.com',
        to: email,
        subject: "One Time Password",
        html: `<html>

        <body>
          <style>
            @font-face {
              font-family: 'Poppins';
              font-style: normal;
              font-weight: normal;
              src: local('PT Sans'), local('PTSans-Regular'),
                url(https://fonts.googleapis.com/css2?family=Poppins&display=swap);
            }
          </style>
          <div style="
                    margin: 0 auto;
                    width: 80%;
                    height: auto;
                    background-color: pink;
                    font-family: Poppins;
                    text-align: center;
                  ">
            <h1 style="width:80%; margin: 0 auto; margin-top: 30px; padding-top:50px">Your OTP for Chat app is:</h1>
            <div style="background: rgb(255, 242, 255); width:80%; margin: 0 auto; margin-top: 20px; text-align: left; padding-left: 17px; padding-top: 2px;">
              <div style="padding-top: 20px; padding-bottom: 20px ;">
                <h1 style="font-size: 17px;">${randomOtp}</h1>
              </div>
            </div>
            <div style="padding-bottom: 30px;">
            </div>
          </div>
        </body>
        
        </html>`
      });
    }


    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      otpSent: randomOtp,
      imgUrl: imgURL,
      isVerified: false
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY
    );

    const tokenUser = await TokenModel.create({
      token: token,
      userId: user._id
    });


    var userResp = JSON.stringify(user);
    userResp = JSON.parse(userResp);
    delete userResp.password;
    delete userResp.otpSent;

    const resp = {
      access_token: token,
      user: userResp,
      msg: "Signed Up. OTP sent to email"
    }

    res.status(201).json(resp);
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY
      );


      let findToken = await TokenModel.find({ userId: user._id });

      if (findToken.length == 0) {
        const tokenUser = await TokenModel.create({
          token: token,
          userId: user._id
        });
      }
      else {
        await TokenModel.findOneAndDelete({ _id: findToken[0]._id });
        const tokenUser = await TokenModel.create({
          token: token,
          userId: user._id
        });
      }



      const userResp = helperMethod(user)

      const resp = {
        token: token,
        user: userResp,
        msg: "Logged In"
      }

      res.status(200).json(resp);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});


router.post("/otpVerify", async (req, res) => {

  try {
    const { email, otp } = req.body;
    let user = await User.find({ email: email });



    if (!(otp.length > 3)) {
      res.status(400).send("Send full OTP");
    }

    if (otp === user[0].otpSent) {
      user[0].isVerified = true;
      let updatedUser = await User.findOneAndUpdate({ email: email }, user[0])

      const userResp = helperMethod(updatedUser);
      userResp['isVerified'] = true;
      res.status(200).send({ user: userResp, msg: "User Verified" });
    }
    else {
      res.status(400).send("Incorrect otp");
    }

  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
