const mongoose = require('mongoose');


const { MONGO_URI } = process.env;
console.log("MONGO_URI", MONGO_URI)
const DatabaseConnect = async () => {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });

}

module.exports = DatabaseConnect;
