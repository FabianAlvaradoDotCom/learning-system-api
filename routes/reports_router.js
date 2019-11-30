const express = require("express");
const router = new express.Router();



// Importing Reports Schema
const Report = require("../models/Report_model");

const Sensor = require("../models/Sensor_model");

// Importing middleware auth
const authMiddleware = require("../middleware/auth-middleware");

//let object_of_jobs = {};


router.post("/get-reports-list", authMiddleware, async (req, res) => {
  try {
    let reports_array = await Report.find({},{_id:0},{ sort: { _id: 1 } /* Sorting by the oldest */ });
    console.log("This is my reports array", reports_array);
    res.status(200).send({ reports_array });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

router.post("/schedule-report", authMiddleware, async (req, res) => {

  const CronJob = require("cron").CronJob;
  const convertToCSVandEmail = require('../report_building_files/csv_converter');

  // When creating a record it is not necessary to save the creation date separately, as it comes in the id, to get it we just need to get it like this:
  // array_of_found_objects[0]._id.getTimestamp()

  // We create a placeholder that will contain the _id of the created document in case that the schedule fails, so we will remove it finding it by the id. We create it outside the try statement so we cna access it from catch block
  let created_report_id;
  let number_of_records_for_reporting = +req.body.number_of_records_for_reporting;
  let scheduling_date = req.body.scheduling_date;

  try {    
    let new_report = new Report({
      report_visible_name: req.body.report_name,
      report_internal_name: "place_holder",
      report_distribution_list: req.body.distribution_list,
      report_email_body: req.body.email_body,
      report_schedule_string: req.body.scheduling_date,
      status: "scheduled"
    });

    let saved_preliminar_report = await new_report.save();

    created_report_id = saved_preliminar_report._id;

    saved_preliminar_report.report_internal_name = `rep_${saved_preliminar_report._id}`;

    let saved_report = await saved_preliminar_report.save();

    console.log(saved_report);

    //* Scheduling the job using STREAM
    const new_new_job = new CronJob( new Date("" + scheduling_date),
      async function() {
        try {

          let streamed_sensors_array = [];

          let find_sensors_with_cursor = Sensor.find(
            {
              // Criteria to find the document
              //sensor_name: "sensor01" // I will send a report of all sensors
            },
            {
              // Properties to ommit sending
              _id: 0,
              __v: 0,
              //sensor_name: 0, // I want the sensor name to be saved, so I add that to the report
              owner: 0,
              reading_type: 0,
              equipment_id: 0
            },
            {
              // Order of the records
              sort: { reading_date: -1 } // Sorting by the newest usign reading date as criteria
            }
            )
            .limit(number_of_records_for_reporting)
            .cursor();            

            find_sensors_with_cursor.on("data", (doc) =>{
              // Converting date milliseconds to string date before sending the report
              let formatted_document_date = new Date(+doc.reading_date);            
              doc.reading_date = formatted_document_date.toLocaleDateString() + " " + formatted_document_date.toLocaleTimeString("es-MX");
              streamed_sensors_array.push(doc);
            });

            find_sensors_with_cursor.on("close", async ()=> {
              //streamed_sensors_array.push(null); // Not necessary, only for csv transfirm, but this is only a query
              await convertToCSVandEmail(saved_report.report_distribution_list, saved_report.report_email_body, streamed_sensors_array, "csv" );              
              streamed_sensors_array = null;
              find_sensors_with_cursor=null;
            });         
          
          saved_report.status = "sent";
          await saved_report.save();
          

        } catch (err) {
          console.error(err);
          res.status(404).send({ error });
        }
      }
    );
    //*/


    new_new_job.start();
    //*/

    res.status(200).send({ message: "Report created successfully" });
  } catch (error) {
    // Getting an error means that the report was not scheduled successfully, so we get rid of the just created DB data:
    const deleted_failed_report = await Report.findOneAndDelete({_id : created_report_id});
    console.log(deleted_failed_report ,error);
    res.status(500).send({ error });
  }
 
});

router.post("/stop-report", authMiddleware, async (req, res) => {
  try {
    let reporte_encontrado = await Report.find({
      _id: "5db9066b1022756d5492c5b9"
    });
    console.log(reporte_encontrado);

    console.log(
      `Esta es la ID: ${reporte_encontrado[0]._id.getTimestamp()}`.green.inverse
    );
    res.status(200).send("Time stamp printed");
  } catch (error) {
    console.log("Error with report", error);
    res.status(500).send("Error with report");
  }
});


module.exports = router;
