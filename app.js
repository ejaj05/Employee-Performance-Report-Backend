const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const performanceRoutes = require('./routes/performance');
const { addEmployee } = require('./controllers/Employee');


dotenv.config();
const app = express();
app.use(express.json());

app.use(cors(
  {
    origin: true,
    credentials: true
  }
));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/performance', performanceRoutes);
app.post('/api/employee/add', addEmployee);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});