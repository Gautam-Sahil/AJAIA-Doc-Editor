require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes); // Added this

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in production-grade mode on port ${PORT}`));