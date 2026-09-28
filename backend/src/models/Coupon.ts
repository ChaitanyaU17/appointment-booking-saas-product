import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validityBonusDays: number;
  isActive: boolean;
  startDate?: Date;
  expiryDate?: Date;
  maxUsageLimit?: number;
  currentUsageCount: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
}

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  validityBonusDays: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  expiryDate: { type: Date },
  maxUsageLimit: { type: Number },
  currentUsageCount: { type: Number, default: 0 },
  minPurchaseAmount: { type: Number },
  maxDiscountAmount: { type: Number },
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
