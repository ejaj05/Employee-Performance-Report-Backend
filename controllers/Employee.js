const Employee = require("../models/Employee");

const addEmployee = async(req,res) => {
    try {
        const { employeeId, name, role, department, baseSalary } = req.body;

        // Validate input
        if (!employeeId || !name || !role || !department || !baseSalary) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create new employee
        const newEmployee = await Employee.create({
            employeeId,
            name,
            role,
            department,
            baseSalary
        });

        res.status(201).json({
            success: true,
            employee: newEmployee
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to add employee' });
    }
}

module.exports = {
    addEmployee
};