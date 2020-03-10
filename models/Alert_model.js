const mongoose = require("mongoose");

// For these records I am not going to save any creation date as I can get it from the _id
const AlertSchema = new mongoose.Schema({
  sensor_name_for_alert: {
    type: String,
    required: true,
    trim: true
  },
  equipment_name: {
    type: String,
    required: true,
    trim: true
  },
  alert_minimum_value: {
    type: Number,
    required: true
  },
  alert_maximum_value: {
    type: Number,
    required: true
  },
  alert_distribution_list: {
    type: String,
    required: true,
    trim: true
  },
  alert_enable_status: {
    type: Boolean,
    required: true
  },
  alert_trigger_status: {
    type: String,
    required: true
  }
});

module.exports = Alert = mongoose.model("Alert", AlertSchema);