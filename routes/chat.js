const express = require("express");
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
require("dotenv").config();
const helperMethod = require('./../utils/helperMethod');
const { AUTHENTICATE } = require('./../middleware/auth.middleware')


const router = express.Router();

const User = require("../Model/user");
const Conversation = require("../Model/ConversationSchema");
const Message = require("../Model/MessageSchema");
const user = require("../Model/user");

router.get("/getUsers", AUTHENTICATE, async (req, res) => {
  try {
    const users = await User.find({}).select('_id imgUrl name');
    var authToken = req.headers.authorization.split(" ")[1];
    const { user_id } = jwt.verify(authToken, process.env.TOKEN_KEY);

    const index = users.findIndex((i) => i.id == user_id);
    users.splice(index, 1);


    res.status(201).json(users);
  }
  catch (err) {
  }
})

router.post("/", AUTHENTICATE, async (req, res) => {
  try {
    const { senderId, receieverId } = req.body;

    const CreateConvo = await Conversation.create({
      members: [senderId, receieverId]
    });

    res.status(201).json(CreateConvo);
  }
  catch (err) {
    res.status(404).json("User not found");
  }
})


router.get("/messages/:id", AUTHENTICATE, async (req, res) => {
  try {
    const id = req.params.id;
    const getCoversations = await Conversation.find({
      members: { $in: req.params.id }
    });
    res.status(201).json(getCoversations);
  }
  catch (err) {
  }
})

router.get("/conversationLists", AUTHENTICATE, async (req, res) => {
  try {
    const authorization = req.headers.authorization;

    if (authorization && authorization?.startsWith('Bearer')) {
      const token = authorization.split(" ")[1];
      const { user_id } = jwt.verify(token, process.env.TOKEN_KEY);
      const getCoversations = await Conversation.find({
        members: { $in: user_id }
      });
      const users = await User.find({}).select('_id imgUrl name');
      const index = users.findIndex((i) => i.id == user_id);
      users.splice(index, 1);



      let UsersInConversation = [];


      if (!getCoversations.length) {
        res.status(201).json(users)
      }


      if (getCoversations.length) {
        getCoversations.map((i) => {
          let temp = i.members.filter((x) => x != user_id);
          let obj = {
            _id: temp[0],
            conversationId: i._id
          }
          UsersInConversation.push(obj)
        })


        UsersInConversation.forEach((x, inx) => {
          let temp = users.filter((z) => !(z._id.equals(x._id)) && !(z._id.equals(user_id)));
          UsersInConversation.push(temp[0])

          let temp1 = users.filter((z) => (z._id.equals(x._id)) && !(z._id.equals(user_id)));

          if (x._id.equals(temp1[0]._id)) {
            UsersInConversation[inx]['imgUrl'] = temp1[0].imgUrl
            UsersInConversation[inx]['name'] = temp1[0].name
          }
        })
        res.status(201).json(UsersInConversation)
      }

      let allUsers = [];

      // if (UsersInConversation.length) {
      //   users.forEach((i) => {
      //     let temp = UsersInConversation.filter((x) => x.user_id.equals(i._id))

      //     if (temp.length) {
      //       let user = {
      //         _id: i._id,
      //         imgUrl: i.imgUrl,
      //         conversationId: temp[0].conversationId,
      //         name: i.name
      //       }

      //       allUsers.push(user)
      //     }
      //   })
      // }

      // let allConversations = []

      // if (allUsers.length) {
      //   allUsers.forEach(async (i) => {
      //     const allMsgs = await Message.find({ conversationId: i.conversationId });

      //     let obj = {
      //       ...i,
      //       lastMsg: allMsgs[allMsgs.length - 1].text
      //     }

      //     console.log("Obj===>", obj)
      //   })
      // }

      res.status(201).json(UsersInConversation)
    }
  }
  catch (err) {
    res.status(404).json(err, "Not getting")
  }
})



router.post("/createMessage", AUTHENTICATE, async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    const createMessage = await Message.create({
      conversationId: conversationId,
      senderId: senderId,
      text: text
    })
    res.status(201).json(createMessage);
  }
  catch (err) {
  }
})

router.get("/conversation/:id", AUTHENTICATE, async (req, res) => {
  try {
    const getConversation = await Message.find({ conversationId: req.params.id });
    // const findById = await Message.find({ _id: "63ac2b92c0723e8519a7ea2d" });

    console.log("getConversation", getConversation)
    res.status(201).json(getConversation);
  }
  catch (err) {
    res.status(404).json("No Chat Found")
  }
})







module.exports = router;
