// Required libraries
const mongoose = require("mongoose");

// Configuration files
const config = require("./config");

const User = require("./models/User_model");

// Making database available outside this module for the server to start it
module.exports = mongoose
  .connect(config.dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true // This will make mongoose to create indexes to make data access faster
  })
  .then(res => {
    console.log("Successfully connected to the DB".blue.inverse);
  })
  .catch(error => {
    throw error;
  });
