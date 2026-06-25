import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true},
    department: { type: String, required: true, trim:true },
    salary: {type: Number, required: true, min: [0, "salary cant be a negative value"]},
    status: { type: String, enum: ['open', 'closed'], default: 'open'},
    filledPositions: { type: Number, default: 0},
    postedBy: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true}
}, {timestamps: true});

jobSchema.index({title: 1});

const Job = mongoose.model('Job',jobSchema);
export default Job;
