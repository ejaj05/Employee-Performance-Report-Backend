const mongoose = require('mongoose');

const performanceReportSchema = new mongoose.Schema({
  employeeId: { type: String, ref: 'Employee', required: true },
  month: { type: String, required: true }, // e.g., "2025-08"
  score: { type: Number, required: true },
  attendance: {
    totalDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    paidLeaveDays: { type: Number, default: 0 },
    sickLeaveDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 }
  },
  clientFeedback: {
    rating: { type: Number, required: true },
    clientLeft: { type: String, default: "False" }
  },
  scoreBreakdown: {
    attendance: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    clientFeedback: { type: Number, default: 0 },
    upskills: { type: Number, default: 0 },
    teamSupports: { type: Number, default: 0 }
  },
  salaryDeduction: { type: Number, default: 0 },
  finalSalary: { type: Number, required: true },
  trend: { type: String, enum: ['upward', 'downward', 'stable'], default: 'stable' },
  status: { type: String, enum: ['Excellent', 'Good', 'Average', 'Poor'], default: 'Average' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PerformanceReport', performanceReportSchema);