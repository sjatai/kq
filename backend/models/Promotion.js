const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  type: { type: String, enum: ['discount', 'coupon', 'referral', 'loyalty', 'bundle'] },
  rules: { type: Object }, // e.g., { condition: { spend: '>100' }, action: { discount: 10 } }
  active: { type: Boolean, default: true },
  businessId: { type: String, required: true }, // Changed to String to match other models
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Promotion', promotionSchema);