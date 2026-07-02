import { Queue } from "bullmq";

export const emailQ = new Queue("emailQ", {
    connection: {
        url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: true
    }
});

export const queueEmail = async (to, subject, body)=>{
    try {
        const job = await emailQ.add("sendEmail", {to, subject, body});
        console.log(`Job [${job.id}] added to email queue for: ${to} `);
        return job;
    } catch(error){
        console.error("Failed to push email to email queue", error);
    }
};