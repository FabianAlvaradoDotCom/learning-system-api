const express = require("express");
const router = new express.Router();

// Importing main Schema
const Sensor = require("../models/Sensor_model");
const Alert = require('../models/Alert_model');

// Importing the middleware auth
const authMiddleware = require("../middleware/auth-middleware");


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


