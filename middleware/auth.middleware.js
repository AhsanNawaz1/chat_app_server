// interceptor for protected calls
var jwt = require("jsonwebtoken");
require("dotenv").config();
const userSchema = require("../Model/user");
const TokensModel = require("../Model/tokenModel");

const AUTHENTICATE = (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    Unauthorized(res);
    return;
  }
  var authToken = req.headers.authorization.split(" ")[1];

  jwt.verify(authToken, process.env.TOKEN_KEY, async (err, decoded) => {
    if (err) {
      Unauthorized(res);
      return;
    } else {
      if (!decoded) {
        Unauthorized(res);
        return;
      } else {
        req.user_id = decoded.user_id;
        const user = await userSchema.findById(req.user_id);
        if (!user) {
          return Unauthorized(res);
        }
        const findToken = await TokensModel.findOne({ userId: req.user_id });

        if (findToken) {
          next();
        } else {
          return Unauthorized(res);
        }
      }
    }
  });
};

const Unauthorized = (res) => {
  res.status(403).send({
    status: false,
    message: "Unauthorized",
  });
};

module.exports = {
  AUTHENTICATE
};



// var jwt = require("jsonwebtoken");
// const Users = require("../Model/user")


// const tokenAuthentication = async (req, res, next) => {

//   try {
//     const authorization = req.headers.authorization;

//     if (authorization && authorization?.startsWith('Bearer')) {
//       const token = authorization.split(" ")[1];

//       const { user_id } = jwt.verify(token, process.env.TOKEN_KEY);

//       req.user = await Users.findOne({ user_id }).select('_id');
//       next();
//     } else {
//       res.status(400).json({ error: 'Authentication token required' });
//     }
//   }
//   catch (err) {
//     res.status(400).json({ error: 'Authentication failed' });
//   }

// }