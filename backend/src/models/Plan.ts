import mongoose, { Document, Schema } from 'mongoose';

export interface IPlanFeatures {
  maxBookingsPerMonth: number;
  maxServices: number;
  maxAdmins: number;
  googleCalendarSync: boolean;
  googleMeetIntegration: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  analyticsAccess: boolean;
}

export interface IPlanVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  billingCycle: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
  durationDays: number;
  price: number;
}

export interface IPlan extends Document {
  price?: number;
  billingCycle?: string;
  name: string;
  slug: string;
  currency: string;
  isActive: boolean;
  isDefault: boolean;
  features: IPlanFeatures;
  variants: IPlanVariant[];
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema({
  name: { type: String, required: true },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time'], required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true }
});

const planSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  price: { type: Number, default: 0 },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time'], default: 'monthly' },
  currency: { type: String, default: 'INR' },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  features: {
    maxBookingsPerMonth: { type: Number, default: 50 },
    maxServices: { type: Number, default: 5 },
    maxAdmins: { type: Number, default: 1 },
    googleCalendarSync: { type: Boolean, default: false },
    googleMeetIntegration: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    analyticsAccess: { type: Boolean, default: false },
  },
  variants: { type: [variantSchema], default: [] },
  displayOrder: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Plan = mongoose.model<IPlan>('Plan', planSchema);
export default Plan;

