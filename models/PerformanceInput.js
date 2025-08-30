const mongoose = require('mongoose');

const performanceInputSchema = new mongoose.Schema({
  employeeId: { type: String,required: true },
  month: { type: String, required: true },
  attendance: {
    totalDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    paidLeaveDays: { type: Number, default: 0 },
    sickLeaveDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 }
  },
  clientFeedback: {
    rating: { type: String, required: true },
    clientLeft: { type: Number, default: 0 }
  },
  upskills: {
    certificateAchieved: Boolean    
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PerformanceInput', performanceInputSchema);