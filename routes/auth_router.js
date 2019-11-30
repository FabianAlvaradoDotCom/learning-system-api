const express = require("express");

// Defining Router
const router = new express.Router();

// Importing Schemas
const User = require("../models/User_model");
const Capturer = require("../models/Capturer_model");
const Sensor = require("../models/Sensor_model");

// Importing the Authentication Middleware
const authMiddleware = require("../middleware/auth-middleware");

// Test route
router.get("/main", authMiddleware, (req, res) => {
  console.log("Main page");
  res.status(400).json(req.user);
});

// Validating License
router.post("/validate-license", async (req, res) => {
  console.log(req.body);
  try {
    const found_capturer = await Capturer.findOne({
      capturer_mac_adress: req.body.pc_mac_address,
      license_id: req.body.hardcoded_license
    });
    if (found_capturer) {
      console.log({ valid_software: found_capturer });
      res.status(200).send({
        valid_license: true,
        equipment_name: found_capturer.equipment_name,
        equipment_id: found_capturer._id,
        capturing_intervals: found_capturer.capturing_intervals
      });
    } else {
      console.log("There is no valid license for this computer");
      res.status(401).send({ valid_license: false });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create an User
router.post("/create-user", async (req, res) => {
  const newUser = new User(req.body);

  try {
    const savedUser = await newUser.save();
    /*----Creating token, see code descriptions from 'login' route */
    const token = await savedUser.generateAuthToken();
    /*------*/
    res
      .status(201)
      .json([
        { message: "Saved successfully!" },
        savedUser.getPublicProfile(),
        token
      ]);
    console.log("Saved successfully:");
    console.log({ user: savedUser.getPublicProfile(), token });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Login User
// In addition we will fetch the latest record created by the user as it is part of the initial application state
router.post("/login", async (req, res) => {
  try {
    // The credentials received in the request body will be compared to the data base
    // for doing that we call the below middleware function.
    // .findByCredentials() is not an existing method, we just created it on the model file
    // The returned value by this function is the user we found in the DB (only of password matched)
    const authenticatedUser = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    // .generateAuthToken() is not an existing method, we just created it on the model file
    // Then we run this function in the middleware that will return a valid token
    const token = await authenticatedUser.generateAuthToken();

    // Next step is fetching the data of the latest record created by the EQUIPMENT
    // we will get the id of the equipment as it was provided in teh request
    let latest_created_record_by_equipment = await Sensor.find(
      { equipment_id: req.body.equipment_id },
      {},
      { sort: { reading_date: -1 } }
    ).limit(1);

    // We add this safety condition, if no sensor has been created ever, we send this in the response:
    if(latest_created_record_by_equipment.length === 0){
      latest_created_record_by_equipment[0] = {
        sensor_name: "no-sensor",
        output_data: 0,
        reading_date: 1
      }
    }

    console.log(`${latest_created_record_by_equipment.length}`.inverse.red);
    // We are sending a secured user data version after the sensitive details are removed by the .getPublicProfile() method
    // and in addition we are sending the latest created record in case there is one
    if (latest_created_record_by_equipment.length === 0) {
      res.status(200).send({
        user: authenticatedUser.getPublicProfile(),
        token,
        latest_record: 0
      });
      console.log(
        { authenticatedUser, token },
        "No previous record".inverse.red
      );
    } else {
      res.status(200).send({
        user: authenticatedUser.getPublicProfile(),
        token,
        latest_record: latest_created_record_by_equipment
      });
      console.log(
        { authenticatedUser, token },
        `${latest_created_record_by_equipment}`.inverse.red
      );
    }
    //
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// This is the login code for visualization Application
router.post("/login-visualization", async (req, res) => {
  try {
    // The credentials received in the request body will be compared to the data base
    // for doing that we call the below middleware function.
    // .findByCredentials() is not an existing method, we just created it on the model file
    // The returned value by this function is the user we found in the DB (only of password matched)
    const authenticatedUser = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    // .generateAuthToken() is not an existing method, we just created it on the model file
    // Then we run this function in the middleware that will return a valid token
    const token = await authenticatedUser.generateAuthToken();

    
      res.status(200).send({
        user: authenticatedUser.getPublicProfile(),
        token
      });
      console.log( authenticatedUser, token );
    
    //
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// Logout One Device
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    // Here we will find the provided token and remove it from the tokens array
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    // We save the user that now will not contain the just used token anymore
    const loggedOutUser = await req.user.save();
    console.log({ loggedOutUser: loggedOutUser.getPublicProfile() });
    res.send(loggedOutUser.getPublicProfile());
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Logout All Devices
router.post("/logout-all", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    console.log(`User ${req.user.email} has closed all sessions successfully`);
    res
      .status(200)
      .send(`User ${req.user.email} has closed all sessions successfully`);
  } catch (err) {
    console.log("Error while closing all user sessions");
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;