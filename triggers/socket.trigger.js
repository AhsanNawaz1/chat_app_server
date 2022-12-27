const { Server } = require('socket.io')

module.exports = function (servers) {

  const io = new Server(servers, {
    cors: {
      origin: "http://cp-chat-app.netlify.app",
      method: ["GET", "POST"]
    }
  })


  let users = [];

  const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };

  io.on("connection", (socket) => {
    //when connect
    console.log(`a user connected >> [socket]`, socket.id);


    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket?.id);
      // console.log("us sers >>", users)
      socket.emit("getUsers", users)
    });

    socket.on("sendMessage", ({ senderId, recieverId, text }) => {
      const userSend = getUser(recieverId);
      io.to(userSend?.socketId).emit("getMessage", {
        _id: "",
        conversationId: "",
        text,
        senderId,
        createdAt: new Date(),
        updatedAt: "",
        __v: ""
      })
    })




    //send and get message
    // socket.on(
    //     "sendMessage", async ({
    //                               msgId,
    //                               conversationId,
    //                               senderId,
    //                               receiverId,
    //                               text,
    //                               productId,
    //                               image,
    //                               createdAt,
    //                               avatar,
    //                           }) => {
    //         // console.log('avatar : ', avatar);
    //         let body;
    //         if (image) {
    //             // console.log('---------- Im in Image Check!!---------------');
    //             // console.log('IMGGGG ---> : ', image);
    //             body = {
    //                 conversationId: conversationId,
    //                 senderId: senderId,
    //                 receiverId: receiverId,
    //                 image: image,
    //                 productId: productId,
    //             };

    //             EVENT.emit("save-message-in-db", body);
    //             // console.log('Message Body to DB : ', body);
    //             const receiver = getUser(receiverId);
    //             // console.log('Receiver : ', receiver);
    //             if (receiver && receiver.socketId) {
    //                 // console.log("receiver >>", receiver);
    //                 io.to(receiver.socketId).emit("getMessage", {
    //                     conversationId: conversationId,
    //                     senderId: senderId,
    //                     image: image,
    //                     _id: msgId,
    //                     productId: productId,
    //                     messageType: "image",
    //                     createdAt: createdAt,
    //                     avatar: avatar,
    //                 });
    //             }

    //             const sender = getUser(senderId);
    //             if (sender && sender.socketId) {
    //                 // console.log("sender >>", sender);
    //                 io.to(sender.socketId).emit("getMessage", {
    //                     conversationId: conversationId,
    //                     senderId: senderId,
    //                     image: image,
    //                     _id: msgId,
    //                     productId: productId,
    //                     messageType: "image",
    //                     createdAt: createdAt,
    //                     avatar: avatar,
    //                 });
    //             }

    //         }

    //         if (text) {
    //             // console.log('---------- Im in Text Check!!---------------');
    //             body = {
    //                 conversationId: conversationId,
    //                 senderId: senderId,
    //                 receiverId: receiverId,
    //                 text: text,
    //                 productId: productId,
    //             };

    //             EVENT.emit("save-message-in-db", body);
    //             // console.log('Message Body to DB : ', body);
    //             // console.log('receiverId---> : ', receiverId);
    //             const receiver = getUser(receiverId);
    //             // console.log('Receiver : ', receiver);
    //             if (receiver && receiver.socketId) {
    //                 // console.log("receiver >>", receiver);
    //                 io.to(receiver.socketId).emit("getMessage", {
    //                     conversationId: conversationId,
    //                     senderId: senderId,
    //                     text: text,
    //                     _id: msgId,
    //                     productId: productId,
    //                     messageType: "text",
    //                     createdAt: createdAt,
    //                     avatar: avatar,
    //                 });
    //             }

    //             // console.log('senderId : ', senderId);
    //             const sender = getUser(senderId);
    //             // console.log('Sender : ', sender);
    //             // console.log('Sender Socket')
    //             if (sender && sender.socketId) {
    //                 // console.log("sender >>", sender);
    //                 io.to(sender.socketId).emit("getMessage", {
    //                     conversationId: conversationId,
    //                     senderId: senderId,
    //                     text: text,
    //                     _id: msgId,
    //                     productId: productId,
    //                     messageType: "text",
    //                     createdAt: createdAt,
    //                     avatar: avatar,
    //                 });
    //             }
    //         }

    //         // const user = getUser(receiverId);
    //         // // const user = getUser(senderId);
    //         // if (user && user.socketId)
    //         //     io.to(user.socketId).emit("getMessage", {
    //         //         senderId,
    //         //         text,
    //         //         msgId,
    //         //     });
    //         // EVENT.emit("save-message-in-db", body);
    //     }
    // );

    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      try {
        removeUser(socket?.id);
      } catch (e) {
        console.log(e);
      }
    });
  });
};
