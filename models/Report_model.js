const mongoose = require("mongoose");

// For these records I am not going to save any creation date as I can get it from the _id
const ReportSchema = new mongoose.Schema({
  report_internal_name: {
    type: String,
    required: true,    
    trim: true
  },report_visible_name: {
    type: String,
    required: true,    
    trim: true
  },report_distribution_list: {
    type: String,
    required: true,    
    trim: true
  },report_email_body: {
    type: String,
    required: true,    
    trim: true
  },report_schedule_string: {
    type: String,
    required: true,    
    trim: true
  },status: {
    type: String,
    required: true,    
    trim: true
  }
});

module.exports = Report = mongoose.model("Report", ReportSchema);
