const express = require("express");
const router = new express.Router();

// Importing main Schema
const Sensor = require("../models/Sensor_model");

// Importing the middleware auth
const authMiddleware = require("../middleware/auth-middleware");

var returnRouter = io => {
  // Creating the new router for sensors reading data
  router.post("/create-sensor-reading", authMiddleware, async (req, res) => {
    try {
      console.log(`${req.body.file_creation_date}`.inverse.yellow);

      req.body.sensors.forEach(async (sent_sensor, index) => {
        let new_sensor = new Sensor({
          sensor_name: sent_sensor.sensor_name,
          output_data: +sent_sensor.output_data,
          unit: sent_sensor.unit,
          numeral_system: sent_sensor.numeral_system,
          reading_type: sent_sensor.reading_type,
          reading_date: +req.body.file_creation_date, // sent_sensor.reading_date
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
      io.emit("sensors-saved", "sensors-saved");
      console.log("Set of sensors saved and socket event triggered");
      res.status(200).json({ message: "Sensors created successfully" });
    } catch (err) {
      console.log(err);
      res.status(err);
    }
  });



// This is the login code for visualization Application
router.post("/three-latest-sensors-for-dashboard",  authMiddleware, async (req, res) => {
  try {
    // Once we are authenticated, we fetch the data of the latest 3 records saved
    let three_latest_records = [ {sensor_name: "sensor01"}, {sensor_name: "sensor02"},{sensor_name: "sensor03"}];

    // We create a function to create an array of latest records, it will be run for each sensor
    const findSensorData = async (sensor_name) => {
      let sensor_output_data_array = await Sensor.find(
        {
          // Conditions to match the sensors
          sensor_name
        },
        {
          // Porperties of the sensor to ommit sending:
          _id: 0,
          __v: 0,
          sensor_name: 0, 
          owner: 0,
          reading_type: 0,
          equipment_id: 0,
          numeral_system: 0,
          reading_date: 0,
          unit: 0
        },
        {
          // Sort criteria
          sort: { reading_date: -1 }
        }
      ).limit(50);
      return sensor_output_data_array;
    };

    let sensor_01_array = await findSensorData(three_latest_records[0].sensor_name);
    let sensor_02_array = await findSensorData(three_latest_records[1].sensor_name);
    let sensor_03_array = await findSensorData(three_latest_records[2].sensor_name);

    res.status(200).send([sensor_01_array, sensor_02_array, sensor_03_array]);
    
    //
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
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
            //reading_date: 0
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

  // Socket event to save data sent by a dynamic sensor:
  io.on("connection", socket_connection => {
    try {
      socket_connection.on("sensor02", async reading_data => {
        const new_sensor = new Sensor({
          sensor_name: "sensor02",
          output_data: +reading_data,
          unit: "deg",
          numeral_system: "dec",
          reading_type: "dynamic",
          reading_date: Date.now(),
          owner: "5d1181cd8973bf34381dc7ac",
          equipment_id: "5d25f128fa6aa8369cf91454"
        });
        let savedSensor = await new_sensor.save();
        io.emit("sensors-saved", "sensors-saved");
        console.log("Set of sensors saved and socket event triggered");
      });
    } catch (error) {
      console.log(error);
    }
  });
  //
  return router;
};
module.exports = returnRouter;

/*
|
|
|
|
|
|
|
|
|
|
*
io.on("connection", socket_connection => {
  console.log("Connected");
  socket_connection.emit("prueba", 50);

  socket_connection.on("back-and-forth", payload => {
    console.log("from client " + payload);

    // This sends to the connected client
    socket_connection.emit("prueba", "mas prueba");

    // This sends to all connected clients
    io.emit("prueba", "all connected!");

    // This sends to everybody but the emitter:
    socket_connection.broadcast.emit("prueba", "mas prueba");

    // This sends the message to everybody when a connection closed (the closed connection will not receive anything as does not exist)
    socket_connection.on("disconnect", () => {
      io.emit("message", "A user has left!");
    });

    // This will receive a message and aknowledge of receiving
    socket_connection.on(
      "message-to-aknowledge",
      (message_received, aknowledgementCallback) => {
        //io.emit(); // This in case we want to share with all connections
        aknowledgementCallback();
      }
    );

    // The below methods send messages to specific 'rooms'
    /*
    io.to('some-room').emit(...)
    socket_connection.broadcast.to('some-room').emit(...)
    //*

    //
  });
});
//*/