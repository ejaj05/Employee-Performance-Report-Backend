const Employee = require('../models/Employee');
const PerformanceInput = require('../models/PerformanceInput');
const PerformanceReport = require('../models/PerformanceReport');

// Helper function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Calculate performance score
const calculatePerformanceScore = (input, employee) => {
  let score = 100;
  const breakdown = {
    attendance: 0,
    clientFeedback: 0,
    upskills: 0,
  };

  // Attendance
  const totalAttendance = input.attendance.presentDays + input.attendance.paidLeaveDays + input.attendance.sickLeaveDays;
  if (totalAttendance === input.attendance.totalDays) {
    if (input.attendance.paidLeaveDays === 0 && input.attendance.sickLeaveDays === 0) {
      score += 5;
      breakdown.attendance += 5;
    }
  }
  const absentPenalty = input.attendance.absentDays * 2;
  score -= absentPenalty;
  breakdown.attendance -= absentPenalty;

  // Client Feedback
  console.log(input)
  if (input.clientFeedback.rating >= 3) {
      score += 5;
      breakdown.clientFeedback += 5;
    } else if (input.clientFeedback.rating <= 2) {
      score -= 5;
      breakdown.clientFeedback -= 5;
    }
    if (input.clientFeedback.clientLeft == "True") {
      score -= 20;
      breakdown.clientFeedback -= 20;
    }

  // Upskilling
  if (input.upskills.certificateAchieved) {
      score += 5;
      breakdown.upskills += 5;
    }

  // Salary Deduction
  let deduction = 0;
  if (score <= 80) {
    deduction = 0.20 + Math.floor((80 - score) / 5) * 0.05;
  }
  const finalSalary = employee.baseSalary * (1 - deduction);

  return { score, breakdown, deduction, finalSalary };
};

// Controller to submit performance data
const submitPerformance = async (req, res) => {
  try {
    const {
      employeeId, name, role, department, baseSalary, month,
      attendance, clientFeedback, upskills
    } = req.body;

    // Create or find employee
    let employee = employeeId ? await Employee.findOne({ employeeId }) : null;
    if(employee){
      if(employee.name !== name || employee.role !== role || employee.department !== department){
        return res.status(400).json({ message: 'Employee details do not match existing records' });
      }
    }
    if (!employee && name && role && department && baseSalary) {
      employee = new Employee({
        employeeId,
        name,
        role,
        department,
        baseSalary
      });
      await employee.save();
    }
    if (!employee) {
      return res.status(400).json({ error: 'Invalid employeeId or missing employee details (name, role, department, baseSalary)' });
    }

    // Save performance input
    const input = new PerformanceInput({
      employeeId,
      month,
      attendance,
      clientFeedback,
      upskills,
    });
    await input.save();

    // Calculate score
    const { score, breakdown, deduction, finalSalary } = calculatePerformanceScore(input, employee);

    let trend = "stable";
    const recentReport = await PerformanceReport.findOne({ employeeId }).sort({ createdAt: -1 });

    if (recentReport) {
      if (score > recentReport.score) {
        trend = "upward";
      } else if (score < recentReport.score) {
        trend = "downward";
      }
    }else{
      if (score > 100) {
        trend = "upward";
      } else if (score < 100) {
        trend = "downward";
      }
    }

    let status = score >= 100 ? "Excellent" : score >= 95 ? "Good" : score >= 85 ? "Average" : "Poor";

    // Save report
    const report = new PerformanceReport({
      employeeId,
      month,
      score,
      attendance,
      clientFeedback,
      scoreBreakdown: breakdown,
      salaryDeduction: deduction,
      finalSalary,
      trend,
      status,
    });
    await report.save();

    res.json({
      employeeId,
      name,
      role,
      department,
      baseSalary,
      month,
      _id: report._id,
      attendance,
      score,
      scoreBreakdown: breakdown,
      deduction,
      finalSalary,
      trend,
      status,
      message: 'Performance report saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to process performance data' });
  }
};

// Controller to get reports (by employeeId and/or month)

const getallReports = async(req,res) => {
  try {
    const reports = await PerformanceReport.find({});

    const transformedReports = await Promise.all(reports.map(async report => {
      const {employeeId} = report;
      const employee = await Employee.findOne({employeeId});
      return {
        report,
        employee
      };
    }));
    return res.json({
      report:transformedReports
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch reports' });
  }
}
const getReports = async (req, res) => {
  try {
    const { id } = req.params;

    const reports = await PerformanceReport.findById(id);
    const {employeeId} = reports;
    const employee = await Employee.findOne({employeeId})
    res.json({
      reports,
      employee
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch reports' });
  }
};

// Controller to get reports by month
const getReportsByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    if (!month) {
      return res.status(400).json({ error: 'Month is required' });
    }

    const reports = await PerformanceReport.find({ month })
    
    const transformReport = await Promise.all(reports.map(async report => {
      const {employeeId} = report;
      const employee = await Employee.findOne({employeeId});
      return {
        report,
        employee
      };
    }))
    res.json(transformReport);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch reports by month' });
  }
};

// Controller to get reports by role
const getReportsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Find employees with the specified role
    const employees = await Employee.find({ role });

    // Find reports for those employees
    const transformReport = await Promise.all(
      employees.map(async(emp) => {
        const report = await PerformanceReport.findOne({ employeeId: emp.employeeId })
        if(report) {
          return {
            report,
            employee: emp
          }
        }
      })
    )

    return res.status(200).json({
      success: true,
      report: transformReport
    });

  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch reports by role' });
  }
};

// Controller to get reports by department
const getReportsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    if (!department) {
      return res.status(400).json({ error: 'Department is required' });
    }

    // Find employees in the specified department
    const employees = await Employee.find({ department });

    // Find reports for those employees
    const transformReport = await Promise.all(
      employees.map(async(emp) => {
        const report = await PerformanceReport.findOne({ employeeId: emp.employeeId })
        if(report) {
          return {
            report,
            employee: emp
          }
        }
      })
    )

    return res.status(200).json({
      success: true,
      report: transformReport
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch reports by department' });
  }
};

module.exports = {
  submitPerformance,
  getReports,
  getReportsByMonth,
  getReportsByRole,
  getReportsByDepartment,
  getallReports
};