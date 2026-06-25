import express from "express";
import Application from "../models/Application.js";
import { authorizeRoles, verifyToken } from "../middleware/auth.js";
import mongoose from "mongoose";
import Job from "../models/Job.js";

const router = express.Router();

router.post('/', verifyToken, authorizeRoles("applicant"), async (req, res, next)=>{
    try{
        const { jobId, coverLetter } = req.body;

        const targetJob =await Job.findOne({_id: jobId, status: 'open'});
        if (!targetJob){
            const error = new Error("This position is no longer available");
            error.statusCode = 400;
            return next(error);
            
        }
        const newApp = new Application({
            candidateId: req.user.id,
            jobId,
            coverLetter
        });

        await newApp.save();

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application: newApp
        });
    } catch(error){
        if (error.code === 11000){
            const duplicateError = new Error("You have already submitted an application to this job");
            return next(duplicateError);
        }
        next(error);
    }
})

router.get('/', verifyToken, authorizeRoles("recruiter"), async (req,res,next)=>{
    try{
        const applications  = await Application.find().populate("candidateId", "username email education").populate("jobId", "title department");
        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch(error){
        next(error);
    }
})

router.patch('/:id/status', verifyToken, authorizeRoles("recruiter"), async (req, res, next)=>{
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        const {status} = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            {status},
            {session, new: true}
        );
        if(!application){
            throw new Error("target application record not found");
        }

        if(status==="hired"){
            const updatedJob = await Job.findByIdAndUpdate(application.jobId, { $inc: {filledPositions: 1}},
                {session, new: true}
            );
            if(!updatedJob){
                throw new Error("The associated job listing is not found");
            }
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            message: `Application status updated to ${status} successfully`,
            application
        });


    } catch(error){
        await session.abortTransaction();
        session.endSession();

        error.statusCode = error.statusCode || 400;
        next(error);
    }
});

export default router;