require("dotenv").config();
const express = require("express");
const userRoute = require("./routes/user");
const DB = require("./Database/config");
const allRoutes = require("./routes/index");
const route = require("./routes/index");
const { fileParser } = require('express-multipart-file-parser');
const http = require('http');
const { Server } = require('socket.io')



const database = async () => {
  await DB();
}

database();
const app = express();
var cors = require('cors');
app.use(cors())
const { API_PORT } = process.env;
const PORT = 5000;

app.use(express.json());
app.use(fileParser({
  rawBodyOptions: {
    limit: '15mb',
  },
}))
app.use(route);
const server = http.createServer(app);
require("./triggers/socket.trigger")(server);
server.listen(process.env.PORT || 5000);







