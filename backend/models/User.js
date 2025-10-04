const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // String ID for MVP
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false }); // No auto ObjectId

module.exports = mongoose.model('User', userSchema);