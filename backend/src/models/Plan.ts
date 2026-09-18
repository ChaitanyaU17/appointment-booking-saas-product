import mongoose, { Document, Schema } from 'mongoose';

export interface IPlanVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  billingCycle: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
  durationDays: number;
  price: number;
}

export interface IGstSettings {
  type: 'inclusive' | 'exclusive';
  rate: number;
}

export interface IPlanLimits {
  maxBookingsPerMonth: number;
  maxServices: number;
  maxAdmins: number;
}

export interface IPlan extends Document {
  name: string;
  slug: string;
  planType: string;
  numberOfShops: number;
  numberOfUsers: number;
  oneTimeFee: number;
  gstSettings: IGstSettings;
  planLimits: IPlanLimits;
  isPublic: boolean;
  controls: string[];
  variants: IPlanVariant[];
  currency: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for backward compatibility during migration
  price?: number;
  billingCycle?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

const variantSchema = new Schema({
  name: { type: String, required: true },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time'], required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true }
});

const gstSettingsSchema = new Schema({
  type: { type: String, enum: ['inclusive', 'exclusive'], default: 'exclusive' },
  rate: { type: Number, default: 18 }
}, { _id: false });

const planSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  planType: { type: String, default: 'PRIMARY' },
  numberOfShops: { type: Number, default: 1 },
  numberOfUsers: { type: Number, default: 1 },
  oneTimeFee: { type: Number, default: 0 },
  gstSettings: { type: gstSettingsSchema, default: () => ({ type: 'exclusive', rate: 18 }) },
  planLimits: {
    maxBookingsPerMonth: { type: Number, default: 50 },
    maxServices: { type: Number, default: 5 },
    maxAdmins: { type: Number, default: 1 }
  },
  isPublic: { type: Boolean, default: false },
  controls: { type: [String], default: [] },
  variants: { type: [variantSchema], default: [] },
  currency: { type: String, default: 'INR' },
  displayOrder: { type: Number, default: 0 },
  
  // Legacy fields
  price: { type: Number, default: 0 },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time'], default: 'monthly' },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true
});

const Plan = mongoose.model<IPlan>('Plan', planSchema);
export default Plan;
