const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
  sensor_name: {
    type: String,
    required: true
  },
  output_data: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  numeral_system: {
    type: String,
    required: true
  },
  reading_type: {
    type: String,
    required: true
  },
  reading_date: {
    type: String,
    required: true
  },
  alert_status: {
    type: String,
    required: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, // By setting this type to this field, we are letting this know
    // that this is linked to another model
    ref: "User", // By using this reference we can pull owner data with populate().execPopulate() method
    required: true
  },
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Capturer",
    required: true
  }
});

module.exports = Sensor = mongoose.model("Sensor", SensorSchema);
