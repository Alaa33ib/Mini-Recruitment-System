import { redisClient } from "../config/redis.js";

export const cacheResponse = (ttl =300) => {
    return async (req, res, next) => {
        const cacheKey = `cache:${req.originalUrl}`;

        try{
            const cachedData = await redisClient.get(cacheKey);

            if(cachedData){
                console.log(`Cache Hit for [${req.originalUrl}]!. Serving from Redis...`);
                return res.status(200).json({
                    success: true,
                    source: 'cache',
                    data: JSON.parse(cachedData)
                });
            }

            console.log(`Cache Miss for [${req.originalUrl}]!. Fetching from MongoDB...`);

            const originalJson = res.json;
            res.json = (body)=>{
                res.json = originalJson;

                if(body && body.success != false){
                    redisClient.set(cacheKey, JSON.stringify(body.data),{EX: ttl    
                        }).catch(err=> console.log('Redis saving error', err));
                }

                return res.json(body);
            };

            next();

        } catch(error){
            console.error("Redis middleware error:");
            next();
        }
    };
};