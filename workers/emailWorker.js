import { Worker } from "bullmq";

const emailWorker = new Worker(
    "emailQ",
    async (job) => {
        const { to, subject, body } =  job.data;

        console.log(`Worker picked up Job: [${job.id}]. processing email to: ${to}...`);

        //await new Promise((resolve)=>setTimeout(resolve, 2000));

        //to test case of error
        throw new Error("Email server connection timeout");
    },
    {
        connection: {
            url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
        }
    }

);

emailWorker.on("failed", (job, err)=>{
    if(job.attemptsMade >= job.opts.attempts){
        console.error(`Job [${job.id}] failed permenantly after all [${job.opts.attempts}] attempts, error:${err.message}`);
    }
    else {
    console.warn(`⚠️ Job [${job.id}] failed attempt ${job.attemptsMade}/${job.opts.attempts}. Backing off...`);    
    }
});

export default emailWorker;