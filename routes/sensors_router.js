const express = require("express");
const router = new express.Router();

// Importing main Schema
const Sensor = require("../models/Sensor_model");
const Alert = require('../models/Alert_model');

const emailAlerts = require('../report_building_files/alerts_mailing');

// Importing the middleware auth
const authMiddleware = require("../middleware/auth-middleware");

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

      // From here we need to update the alerts colection

      let found_alert_limit = await Alert.findOne({sensor_name_for_alert: sent_sensor.sensor_name});
      console.log('ALERTS RELATED', found_alert_limit);

      // First we identify if the output data of captured sensor is less than the minimum limit
      if(+sent_sensor.output_data < found_alert_limit.alert_minimum_value ){

        // As we had an alert, here we find if the sensor alert is not already triggered ("0") or if it was marked as "higher", and in addition we confirm that the alerts are enabled for this sensor, if so send an email or sms to the recipients, and also we update teh status of the alerts for this sensor
        if(found_alert_limit.alert_trigger_status !== "lower" && found_alert_limit.alert_enable_status === true){
          emailAlerts(found_alert_limit.alert_distribution_list, `The sensor ${sent_sensor.sensor_name} received data that is below the expected range of possible conditions. You are receiving this because you are in the list of recipients to be notified on issues.`);
          found_alert_limit.alert_trigger_status = "lower";
          await found_alert_limit.save();
        }

        // Then no matter if the alerts are triggered, we append a "lower" label to the sensor for it to show an indicator in the table
        new_sensor.alert_status = "lower";
        console.log("ALERT SAVED, IT WAS LOWER");

        // We identify if the output data of captured sensor is greater than maximum limit
      }else if(+sent_sensor.output_data > found_alert_limit.alert_maximum_value ){

        // As we had an alert, here we find if the sensor alert is not already triggered ("0") or if it was marked as "lower", and in addition we confirm that the alerts are enabled for this sensor, if so send an email or sms to the recipients, and also we update teh status of the alerts for this sensor
        if(found_alert_limit.alert_trigger_status !== "higher" && found_alert_limit.alert_enable_status === true){
          emailAlerts(found_alert_limit.alert_distribution_list, `The sensor ${sent_sensor.sensor_name} received data that is above the expected range of possible conditions. You are receiving this because you are in the list of recipients to be notified on issues.`);
          found_alert_limit.alert_trigger_status = "higher";
          await found_alert_limit.save();
        }

        // Then no matter if the alerts are triggered, we append a "higher" label to the sensor for it to show an indicator in the table
        new_sensor.alert_status = "higher";
        console.log("ALERT SAVED, IT WAS HIGHER");
      }

    

      // After we defined if an alert record applies, we save the sensor reading
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
   
    console.log("Set of sensors saved and socket event triggered");
    res.status(200).json({ message: "Sensors created successfully" });
  } catch (err) {
    console.log(err);
    res.status(err);
  }
});

// This is the login code for visualization Application
router.post("/three-latest-sensors-for-dashboard", authMiddleware, async (req, res) => {
    try {
      // Once we are authenticated, we fetch the data of the latest 3 records saved
      let three_latest_records = [
        { sensor_name: "sensor01" },
        { sensor_name: "sensor02" },
        { sensor_name: "sensor03" }
      ];

      // We create a function to create an array of latest records, it will be run for each sensor
      const findSensorData = async sensor_name => {
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
            //reading_date: 0,
            unit: 0
          },
          {
            // Sort criteria
            sort: { reading_date: -1 }
          }
        ).limit(50);
        return sensor_output_data_array;
      };

      let sensor_01_array = await findSensorData(
        three_latest_records[0].sensor_name
      );
      let sensor_02_array = await findSensorData(
        three_latest_records[1].sensor_name
      );
      let sensor_03_array = await findSensorData(
        three_latest_records[2].sensor_name
      );

      // In addition we need to let the system know if there are any alerts

      let number_of_alerts = await Alert.find({alert_trigger_status: {$ne: "0"}},{},{});


      res.status(200).send([sensor_01_array, sensor_02_array, sensor_03_array, number_of_alerts]);

      //
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  }
);

// Request to fetch the latest readings of a sensor for the TABLE
router.post("/latest-single-sensor-readings", authMiddleware, async (req, res) => {
    try {
      let sensor_to_fetch = req.body.selected_sensor;
      // Finding what is this used for
      /*let found_sensor_readings = await Sensor.find(
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
      ).limit(20); */

      // Request to fetch the latest readings of a sensor for the TABLE (limited to 200)
      let found_sensor_readings_graph = Sensor.find(
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
          numeral_system: 0
          //reading_date: 0
        },
        {
          // Order of the records
          sort: { reading_date: -1 } // Sorting by the newest usign reading date as criteria
        }
      ).limit(req.body.limit)//).limit(200);
      .cursor();

      //console.log(found_sensor_readings);



      let streamed_array_of_found_readings = [];

      found_sensor_readings_graph.on("data", (doc) =>{                   
        streamed_array_of_found_readings.push(doc);
      });

      found_sensor_readings_graph.on("close", async ()=> { 
        
        let number_of_alerts = await Alert.find({alert_trigger_status: {$ne: "0"}},{alert_minimum_value:0, alert_maximum_value:0, equipment_name: 0, alert_distribution_list:0, _id:0},{});
        let min_max_alert_current_sensor = await Alert.findOne({sensor_name_for_alert:sensor_to_fetch},{ sensor_name_for_alert:0, equipment_name: 0, alert_distribution_list:0, alert_trigger_status:0, _id:0 },{});

        res.status(200).send({sensor_readings: streamed_array_of_found_readings, number_of_alerts, min_max_alert: min_max_alert_current_sensor});
                      
        //streamed_array_of_found_readings = null;
        //found_sensor_readings_graph = null;
      });

      

    } catch (error) {
      console.log(error);
      res.status(404).send({message: "There was an error", error});
    }
  }
);

module.exports = router;


