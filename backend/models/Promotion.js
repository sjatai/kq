import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  type: { type: String, enum: ['discount', 'coupon', 'referral', 'loyalty', 'bundle'] },
  rules: { type: Object }, // e.g., { condition: { spend: '>100' }, action: { discount: 10 } }
  active: { type: Boolean, default: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Promotion', promotionSchema);