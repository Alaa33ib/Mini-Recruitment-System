import express from "express";
import Job from "../models/Job.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post('/', verifyToken, authorizeRoles('recruiter'), async (req, res, next)=> {
    try {
        const { title, department, salary} = req.body;

        const newJob = new Job({
            ...req.body,
            postedBy: req.user.id
        });

        await newJob.save();

        res.status(201).json({
            success: true,
            message: "Job successfully added",
            job: newJob
        });

    } catch(error){
        next(error);
    }
});

router.get('/', verifyToken, async (req, res, next)=>{
    try{
        const jobs = await Job.find({status: 'open'}).populate("postedBy", "username company");

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch(error){
        next(error);
    }
});

export default router;
