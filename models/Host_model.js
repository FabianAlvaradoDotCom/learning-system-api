const mongoose = require("mongoose");
const HostSchema = new mongoose.Schema({
  host_mac_adress: {
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
  owner_name: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = Host = mongoose.model("Host", HostSchema);
