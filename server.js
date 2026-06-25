import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/jobs', jobRoutes);
app.use("/api/applications", applicationRoutes);

app.use((error, req, res, next)=>{
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: error.message || "Internal Server Error"
    });
});

const PORT  = process.env.PORT || 3000;
app.listen( PORT, ()=> console.log(`System running on http://localhost:${PORT}`));
