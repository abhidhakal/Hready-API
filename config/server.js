const mongoose = require("mongoose");


const connectDB = () => {

  mongoose.connect(process.env.DB_URL).then(() => {

    console.log("DB CONNECTED to " + process.env.DB_URL);

  }).catch((err) => {

    console.log(err);

  });

};



module.exports = connectDB;