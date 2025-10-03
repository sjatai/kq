const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Install if needed: npm install bcryptjs

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Allow string IDs for MVP
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  businessName: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false }); // Disable auto ObjectId

// Pre-save hook for password hashing (optional)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);


