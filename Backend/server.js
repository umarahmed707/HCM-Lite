import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// 1. Routes Imports
import authRoutes from './src/routes/authRoutes.js';
import orgRoutes from './src/routes/orgRoutes.js';
import empRoutes from './src/routes/empRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import leaveRoutes from './src/routes/leaveRoutes.js';
import payrollRoutes from './src/routes/payrollRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import commsRoutes from './src/routes/commsRoutes.js';

dotenv.config();

const app = express();

// 2. Global Middlewares
app.use(cors());
app.use(express.json());

// 3. Health Check Route (Testing ke liye)
// app.get('/', (req, res) => {
//   res.json({ message: 'HCM Lite API Server is running smoothly!' });
// });

// 4. API Endpoints Registration
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/employees', empRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/comms', commsRoutes);

// 5. Global 404 & Error Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const __dirname = path.resolve();
const __frontend = path.join(__dirname, "hcm-lite", "dist");

app.use(express.static(__frontend));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__frontend, "index.html"));
});
// 6. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HCM Lite Server running on http://localhost:${PORT}`);
});