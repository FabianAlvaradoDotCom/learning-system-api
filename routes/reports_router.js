const express = require("express");
const router = new express.Router();

const { Parser } = require("json2csv");

const CronJob = require("cron").CronJob;

const sendReportByEmail = require("../emailer/emailer");

// Importing Reports Schema
const Report = require("../models/Report_model");

const Sensor = require("../models/Sensor_model");

// Importing middleware auth
const authMiddleware = require("../middleware/auth-middleware");

let object_of_jobs = {};

const retrieveAllReports = async () => {
  let all_reports = await Report.find();
  return all_reports;
};

router.post("/get-reports-list", authMiddleware, async (req, res) => {
  try {
    let reports_array = await retrieveAllReports();
    console.log("This is my reports array", reports_array);
    res.status(200).send({ reports_array });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

router.post("/schedule-report", authMiddleware, async (req, res) => {
  // When creating a record it is not necessary to save the created date separately, as it comes in the id, to get it we just need to get it like this:
  // array_of_found_objects[0]._id.getTimestamp()
  try {
    console.log(req.body);
    //*
    let new_report = new Report({
      report_visible_name: req.body.report_name,
      report_internal_name: "place_holder",
      report_distribution_list: req.body.distribution_list,
      report_email_body: req.body.email_body,
      report_schedule_string: req.body.scheduling_date
    });
    let preliminar_report = await new_report.save();

    preliminar_report.report_internal_name = `rep_${preliminar_report._id}`;

    let saved_report = await preliminar_report.save();

    console.log(saved_report);

    //*
    object_of_jobs[preliminar_report.report_internal_name] = new CronJob(
      new Date("" + req.body.scheduling_date),
      async function() {
        try {
          let report_sensor_readings = await Sensor.find(
            {
              // Criteria to find the document
              sensor_name: "sensor01"
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
          ).limit(200);

          const fields = ["output_data", "reading_date"];
          const opts = { fields };

          const parser = new Parser(opts);
          const csv = parser.parse(report_sensor_readings);
          console.log(csv);
          console.log(`Sending email`.yellow.inverse);
          sendReportByEmail(
            saved_report.report_distribution_list,
            saved_report.report_email_body,
            csv
          );
        } catch (err) {
          console.error(err);
          res.status(500).send({ error });
        }
      }
    );

    object_of_jobs[preliminar_report.report_internal_name].start();
    //*/

    res.status(200).send({ message: "Report created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }

 
});

router.post("/destruir-report", authMiddleware, async (req, res) => {
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
