const express = require('express');
const {
  submitPerformance,
  getReports,
  getReportsByMonth,
  getReportsByRole,
  getReportsByDepartment,
  getallReports
} = require('../controllers/performanceController');

const router = express.Router();

router.post('/submit', submitPerformance);

router.get('/reports/:id', getReports);
router.get('/reports/month/:month', getReportsByMonth);
router.get('/reports/role/:role', getReportsByRole);
router.get('/reports/department/:department', getReportsByDepartment);
router.get('/reports', getallReports);

module.exports = router;