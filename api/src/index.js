require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const classesRoutes = require('./routes/classes');
const examsRoutes = require('./routes/exams');
const studentsRoutes = require('./routes/students');
const questionsRoutes = require('./routes/questions');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', authenticateToken, classesRoutes);
app.use('/api/exams', authenticateToken, examsRoutes);
app.use('/api/students', authenticateToken, studentsRoutes);
app.use('/api/questions', authenticateToken, questionsRoutes);

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing
