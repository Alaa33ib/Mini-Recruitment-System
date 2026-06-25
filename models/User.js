import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    institution: {type: String, required: true},
    degree: { type: String, required: true},
    gradYear: {type: Number, required: true}
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true},
    email: { type: String, required: true, unique: true, lowercase: true, trim:true},
    password: { type: String, required: true, select: false},
    role: { type: String, enum: ['applicant', 'recruiter'], required: true},
    company: { type: String, required: function (){return this.role ==='recruiter';}},
    education: [educationSchema]

}, {timestamps: true});

const User = mongoose.model("User",userSchema);
export default User;