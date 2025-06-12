import express from 'express';
import dotenv from 'dotenv';
import passport from './auth/gAuth.js';
import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

const app = express();
dotenv.config();
app.use(express.json());

app.use(passport.initialize());
// Routes
app.use('/auth', authRoutes);
app.use('/api/v1/interview' , interviewRoutes); 
app.get('/', (req, res) => {
  res.send('Server is running!');
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});