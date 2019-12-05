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

  let html_alert_email_body = [];
  let found_alert_limit;
  try {
    console.log(`${req.body.file_creation_date}`.inverse.yellow);

    let forEach_counter = 0;
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

      found_alert_limit = await Alert.findOne({sensor_name_for_alert: sent_sensor.sensor_name});
      //console.log('ALERTS RELATED', found_alert_limit);
      // First we identify if the output data of captured sensor is less than the minimum limit
      if(+sent_sensor.output_data < found_alert_limit.alert_minimum_value ){

        // As we had an alert, here we find if the sensor alert is not already triggered ("0") or if it was marked as "higher", and in addition we confirm that the alerts are enabled for this sensor, if so send an email or sms to the recipients, and also we update teh status of the alerts for this sensor
        if(found_alert_limit.alert_trigger_status !== "lower" && found_alert_limit.alert_enable_status === true){         
          // Instead of sending an email for each sensor, we attach the new the found email with alerts so we send just an email.
          html_alert_email_body.push(`<br> <b>${sent_sensor.sensor_name}</b> : <b>${+sent_sensor.output_data}</b>, alert triggered below: <b>${found_alert_limit.alert_minimum_value}</b>`);
          found_alert_limit.alert_trigger_status = "lower";
          await found_alert_limit.save();
        }

        // Then no matter if the alerts are triggered, we append a "lower" label to the sensor for it to show an indicator in the table
        new_sensor.alert_status = "lower";
        //console.log("ALERT SAVED, IT WAS LOWER");

        // We identify if the output data of captured sensor is greater than maximum limit
      }else if(+sent_sensor.output_data > found_alert_limit.alert_maximum_value ){

        // As we had an alert, here we find if the sensor alert is not already triggered ("0") or if it was marked as "lower", and in addition we confirm that the alerts are enabled for this sensor, if so send an email or sms to the recipients, and also we update teh status of the alerts for this sensor
        if(found_alert_limit.alert_trigger_status !== "higher" && found_alert_limit.alert_enable_status === true){          
          // Instead of sending an email for each sensor, we attach the new the found email with alerts so we send just an email.
          html_alert_email_body.push(`<br> <b>${sent_sensor.sensor_name}</b> : <b>${+sent_sensor.output_data}</b>, alert triggered above: <b>${found_alert_limit.alert_maximum_value}</b>`);
          found_alert_limit.alert_trigger_status = "higher";
          await found_alert_limit.save();
        }

        // Then no matter if the alerts are triggered, we append a "higher" label to the sensor for it to show an indicator in the table
        new_sensor.alert_status = "higher";
        //console.log("ALERT SAVED, IT WAS HIGHER");
      }

    

      // After we defined if an alert record applies, we save the sensor reading
      let saved_sensor = await new_sensor.save();
      forEach_counter += 1;
      //console.log(saved_sensor);
      if(forEach_counter >= req.body.sensors.length){
      //console.log(req.body.sensors.length);
      // console.log(html_alert_email_body.length);
      // console.log(html_alert_email_body);
      
        if(html_alert_email_body.length > 0){
          //console.log(html_alert_email_body.join());
          html_alert_email_body.sort();
          html_alert_email_body.unshift("The below are the sensors that were capturing data out of range:");
          await emailAlerts(found_alert_limit.alert_distribution_list, html_alert_email_body.join(''));
          res.status(200).json({ message: "Sensors created successfully", numero: req.body.sensors.length });
        }else{
          res.status(200).json({ message: "Sensors created successfully", numero: req.body.sensors.length });
        }
      }
    });   

    
  } catch (err) {
    console.log(err);
    res.status(err);
  }
});

module.exports = router;


