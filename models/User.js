const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['user', 'rider', 'admin'], required: true },
    isEmailVerified: { type: Boolean, default: false },
    emailOtpHash: { type: String },
    emailOtpExpiresAt: { type: Date },
    emailOtpRequestedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
