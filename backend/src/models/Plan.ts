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

export interface IPlan extends Document {
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
  isDefault: boolean;
  features: IPlanFeatures;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  price: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'INR' },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
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
  displayOrder: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Plan = mongoose.model<IPlan>('Plan', planSchema);
export default Plan;
