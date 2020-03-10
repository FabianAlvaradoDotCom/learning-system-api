const mongoose = require("mongoose");
const CapturerSchema = new mongoose.Schema({
  equipment_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capturer_mac_adress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  license_id: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  capturing_intervals: {
    type: Number,
    required: true
  }
});

module.exports = Capturer = mongoose.model("Capturer", CapturerSchema);
