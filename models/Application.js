import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    candidateId:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true},
    status: { type: String, enum: ['applied', 'interviewing', 'rejected', 'hired'], default: 'applied'},
    coverLetter: {type: String, trim: true}
}, {timestamps: true});

applicationSchema.index({candidateId: 1, jobId: 1}, {unique: true});

const Application = mongoose.model("Application", applicationSchema);

export default Application;