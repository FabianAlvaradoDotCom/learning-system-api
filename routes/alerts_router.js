const express = require("express");
const router = new express.Router();

// Importing Alerts Schema
const Alert = require("../models/Alert_model");

// Importing middleware auth
const authMiddleware = require("../middleware/auth-middleware");

router.post("/get-alerts-list", authMiddleware, async (req, res) => {
  try {
    let alerts_array = await Alert.find(
      {},
      {_id:0},
      { sort: { _id: 1 } /* Sorting by the oldest */ }
    );
    console.log("This is my alerts array", alerts_array);
    res.status(200).send(alerts_array);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

router.post("/get-equipments-with-alerts", authMiddleware, async (req, res) => {
  try{
    let number_of_alerts = await Alert.find({alert_trigger_status: {$ne: "0"}},{},{});
    res.status(200).send(number_of_alerts);
  }catch(error){
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/edit-alert", authMiddleware, async (req, res) => {
  // When creating a record it is not necessary to save the created date separately, as it comes in the id, to get it we just need to get it like this:
  // array_of_found_objects[0]._id.getTimestamp()
  try {
    let new_alert = new Alert({
      alert_visible_name: req.body.alert_name,
      alert_internal_name: "place_holder",
      alert_distribution_list: req.body.distribution_list,
      alert_email_body: req.body.email_body,
      alert_schedule_string: req.body.scheduling_date,
      status: "scheduled"
    });

    let saved_preliminar_alert = await new_alert.save();

    res.status(200).send({ message: "Alert created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});


router.post("/clear-all-alerts", authMiddleware, async (req, res) => {
  try{
    let all_alerts_array = await Alert.find({});
    all_alerts_array.forEach(async (alert) => {
      alert.alert_trigger_status = "0";


      alert.alert_distribution_list = "fabian.rhcp@gmail.com, jazminolivo33@gmail.com";

      
      await alert.save();
    });

    res.status(200).send({ message: "Alerts cleared successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});
module.exports = router;