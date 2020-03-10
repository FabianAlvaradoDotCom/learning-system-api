const express = require("express");
const router = new express.Router();

// Importing main Schema
const Sensor = require("../models/Sensor_model");

// Importing the middleware auth
const authMiddleware = require("../middleware/auth-middleware");

// Creating the new router for sensors reading data
router.post("/create-sensor-reading", authMiddleware, async (req, res) => {
  try {
    console.log(`${req.body.file_creation_date}`.inverse.yellow);
    req.body.sensors.forEach(async sent_sensor => {
      let new_sensor = new Sensor({
        sensor_name: sent_sensor[Object.keys(sent_sensor)[0]],
        output_data: sent_sensor.output_data,
        unit: sent_sensor.unit,
        numeral_system: sent_sensor.numeral_system,
        reading_type: "static", // sent_sensor.reading_type,
        reading_date: req.body.file_creation_date, // sent_sensor.reading_date
        owner: req.user._id, // We are using the user id that was decoded from the authentication
        // process and passed in the request
        equipment_id: req.body.equipment_id // We are using the Equipment/Capturer id that was sent by the
        //application process and passed in the request
      });
      let saved_sensor = await new_sensor.save();
      console.log(saved_sensor);
    });
    /*Commenting out actual code to test the array
    const new_sensor = new Sensor({
      // ES6 spread operator, we are copying all properties of the req.body
      // and in addition creating the below
      ...req.body,
      // Next we are using the data fetched by the authentication method to create the "owner" field
      owner: req.user._id
    });
    // Using the populate method does not change the data sent to the DB, it instead is just used to
    // work as an additional reference.

    // await new_sensor.populate("owner").execPopulate(); this will not save data populated data.
    const saved_sensor = await new_sensor.save();

    // We better use the populate before sending as a response, IS ASYNCHONOUS SO USE AWAIT!
    await saved_sensor.populate("owner").execPopulate();
    */
    console.log("Set of sensors saved");
    res.status(200).json({ message: "Sensors created successfully" });
  } catch (err) {
    console.log(err);
    res.status(err);
  }
});

// Request to fetch the latest readings of a sensor for the TABLE
router.post(
  "/latest-single-sensor-readings",
  authMiddleware,
  async (req, res) => {
    try {
      let sensor_to_fetch = req.body.selected_sensor;
      let found_sensor_readings = await Sensor.find(
        {
          // Criteria to find the document
          sensor_name: sensor_to_fetch
        },
        {
          // Properties to ommit sending
          _id: 0,
          __v: 0,
          sensor_name: 0,
          owner: 0,
          reading_type: 0,
          equipment_id: 0
        },
        {
          // Order of the records
          sort: { reading_date: -1 } // Sorting by the newest usign reading date as criteria
        }
      ).limit(20);

      // Request to fetch the latest readings of a sensor for the TABLE (limited to 200)
      let found_sensor_readings_graph = await Sensor.find(
        {
          // Criteria to find the document
          sensor_name: sensor_to_fetch
        },
        {
          // Properties to ommit sending
          _id: 0,
          __v: 0,
          sensor_name: 0,
          owner: 0,
          reading_type: 0,
          equipment_id: 0,
          unit: 0,
          numeral_system: 0,
          reading_date: 0
        },
        {
          // Order of the records
          sort: { reading_date: -1 } // Sorting by the newest usign reading date as criteria
        }
      ).limit(200);

      //console.log(found_sensor_readings);
      res.json({ found_sensor_readings, found_sensor_readings_graph });
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;