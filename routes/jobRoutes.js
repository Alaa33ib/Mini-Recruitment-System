import express from "express";
import Job from "../models/Job.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.js";
import { cacheResponse } from "../middleware/caching.js";
import { redisClient } from "../config/redis.js";

const router = express.Router();

router.post('/', verifyToken, authorizeRoles('recruiter'), async (req, res, next)=> {
    try {
        const { title, department, salary} = req.body;

        const newJob = new Job({
            ...req.body,
            postedBy: req.user.id
        });

        await newJob.save();

        await redisClient.del("cache:/api/jobs");
        console.log("Global jobs cache deleted due to new job post")

        res.status(201).json({
            success: true,
            message: "Job successfully added",
            job: newJob
        });

    } catch(error){
        next(error);
    }
});

router.get('/', verifyToken, cacheResponse(300), async (req, res, next)=>{
    try{
        const jobs = await Job.find({status: 'open'}).populate("postedBy", "username company");

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch(error){
        next(error);
    }
});

router.get('/:id', verifyToken, cacheResponse(300), async (req, res, next)=>{
    try{
        const job = await Job.findById(req.params.id).populate("postedBy", "username company");

        if(!job){
            const error = new Error("Job not found");
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch(error){
        next(error);
    }
});

export default router;
