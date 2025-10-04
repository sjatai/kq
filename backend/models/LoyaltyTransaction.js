const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // String ID
  businessId: { type: String, required: true },
  customerId: { type: String, required: true },
  type: { type: String, enum: ['add', 'consume'], required: true },
  amount: { type: Number, required: true },
  event: { type: String, enum: ['purchase', 'entry', 'exit', 'redemption'], required: true },
  balanceAfter: { type: Number, required: true },
  promotionId: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);