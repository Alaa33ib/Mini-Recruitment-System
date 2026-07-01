import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

// Middleware that verifies tokens attached to the request's headder from the client
export const verifyToken = async (req, res, next) => {

    try{
        //get the headder to check authorization
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')){
            const error = new Error("Access denied, no security token provided.");
            error.statusCode = 401;
            return next(error);
        }
        //extract the token from the headder authorization string
        const token = authHeader.split(' ')[1];

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id){
            const error = new  Error("Invalid token format");
            error.statusCode = 403;
            return next(error);
        }

        const sessionKey = `session:${decoded.id}`;

        const cachedSession = await redisClient.get(sessionKey);

        if(cachedSession){
            console.log(`Session cache hit for user [${decoded.id}]! Skipping token validation... `)
            req.user = JSON.parse(cachedSession);
            return next();
        }

        console.log(`Session cache missed for user [${decoded.id}]! verifying token...`);

        const verifiedJwt = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = verifiedJwt;

        await redisClient.set(sessionKey, JSON.stringify(verifiedJwt), {EX: 86400
            }).catch(err=> console.error("Session cache saving eorror:", err));

        next();

    }  catch(err){
        const error = new Error("Invalid or expired token.");
        error.statusCode = 403;
        return next(error);
    }
};

// Middleware to check roles of users to approve their request or deny it, takes in a list of allowed roles.
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) =>{
        if(!req.user){
            const error = new Error("Server configuration error: Token verification is required first");
            error.statusCode = 500;
            return next(error);
        }

        if(!allowedRoles.includes(req.user.role)){
            const error = new Error("youre not authorized to perform this action");
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};