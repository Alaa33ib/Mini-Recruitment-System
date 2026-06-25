import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post('/register', async (req, res, next)=>{
    try{
        const { username, email, password, role, company, education }= req.body;
        if (await User.findOne({$or: [{email: email.toLowerCase()},{username}]})){
            const error = new Error("Username or email already exists.");
            error.statusCode = 400;
            return next(error);
        }

        const salt  = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username, email, password: hashedPassword, role, 
            company: role=== "recruiter" ? company : undefined,
            education: role=== 'applicant' ? education :  undefined
        });

        await newUser.save();

        const response = newUser.toObject();
        delete response.password;

        res.status(201).json({
            success: true,
            message: `successfully registered as ${role}`,
            user: response
        });

    } catch(error){
        next(error)
    }
});

router.post('/login', async (req, res, next)=>{
    try{
        const {email, password} = req.body;
        const userFound = await User.findOne({ email: email.toLowerCase()}).select("+password");
        if (!userFound){
            const error = new Error("invalid email.");
            error.statusCode = 401;
            return next(error);
        }
        
        const isMatch = await bcrypt.compare(password, userFound.password);
        if(!isMatch){
            const error = new Error("Invalid password.");
            error.statusCode = 401;
            return next(error);
        }

        const token = jwt.sign(
            { id: userFound._id, role: userFound.role },
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        res.status(200).json({
            success: true,
            message: `successfully logged in and authenticated`,
            token: `Bearer ${token}`
        });

    } catch(error){
        next(error);
    }

   
});

export default router;