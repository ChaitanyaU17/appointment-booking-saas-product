import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  ownerName?: string;
  slug: string;
  category: string;
  registrationNumber: string;
  description?: string;
  additionalNotes?: string;
  email?: string;
  phone?: string;
  logo?: string;
  planId?: mongoose.Types.ObjectId;
  planVariantId?: mongoose.Types.ObjectId;
  planStartDate?: Date;
  planEndDate?: Date;
  discountPercentage?: number;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  paymentReferenceId?: string;
  paymentMethod?: string;
  paymentToken?: string;
  paymentLinkGeneratedAt?: Date;
  paymentBreakdown?: {
    planId?: mongoose.Types.ObjectId;
    startDate?: string;
    endDate?: string;
    planVariantId?: mongoose.Types.ObjectId;
    planName?: string;
    basePrice: number;
    discountAmount: number;
    platformDiscountAmount?: number;
    couponDiscountAmount?: number;
    gstAmount: number;
    totalAmount: number;
    couponCodes?: string[];
  };
  
  verificationStatus: 'Pending' | 'ChangesRequested' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  changesRequestedNote?: string;
  resubmitNote?: string;
  requestedPlanId?: mongoose.Types.ObjectId;
  requestedPlanVariantId?: mongoose.Types.ObjectId;

  // Superadmin Controlled Trial & Demo Flow
  trialStatus: 'None' | 'Active' | 'Expired' | 'Converted';
  trialPlanId?: mongoose.Types.ObjectId;
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  originalPlanId?: mongoose.Types.ObjectId;
  isDemoAccount?: boolean;
  demoStatus?: 'None' | 'Provided' | 'Conducted';
  demoBusinessId?: mongoose.Types.ObjectId;
  onboardingMeetLink?: string;
  assignedAgentId?: mongoose.Types.ObjectId;
  registeredByAgentId?: mongoose.Types.ObjectId;

  subscriptionStatus: 'active' | 'expired' | 'trial' | 'cancelled';
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  settings: {
    timezone: string;
    currency: string;
    defaultPrice?: number;
    availableHours: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isClosed: boolean;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema: Schema = new Schema({
  name: { type: String, default: '' },
  ownerName: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  category: { type: String, default: 'N/A' },
  registrationNumber: { type: String, default: 'N/A' },
  description: { type: String },
  additionalNotes: { type: String },
  email: { type: String },
  phone: { type: String },
  logo: { type: String },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  planVariantId: { type: Schema.Types.ObjectId, default: null },
  planStartDate: { type: Date },
  planEndDate: { type: Date },
  discountPercentage: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentReferenceId: { type: String },
  paymentMethod: { type: String },
  paymentToken: { type: String },
  paymentLinkGeneratedAt: { type: Date },
  paymentBreakdown: {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    startDate: { type: Date },
    endDate: { type: Date },
    planVariantId: { type: mongoose.Schema.Types.ObjectId },
    planName: { type: String },
    basePrice: { type: Number },
    discountAmount: { type: Number },
    platformDiscountAmount: { type: Number },
    couponDiscountAmount: { type: Number },
    gstAmount: { type: Number },
    totalAmount: { type: Number },
    couponCodes: { type: [String] },
  },

  verificationStatus: { type: String, enum: ['Pending', 'ChangesRequested', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String },
  changesRequestedNote: { type: String },
  resubmitNote: { type: String },
  requestedPlanId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  requestedPlanVariantId: { type: Schema.Types.ObjectId, default: null },

  // Superadmin Controlled Trial & Demo Flow
  trialStatus: { type: String, enum: ['None', 'Active', 'Expired', 'Converted'], default: 'None' },
  trialPlanId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  trialStartedAt: { type: Date },
  trialEndsAt: { type: Date },
  originalPlanId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  isDemoAccount: { type: Boolean, default: false },
  demoStatus: { type: String, enum: ['None', 'Provided', 'Conducted'], default: 'None' },
  demoBusinessId: { type: Schema.Types.ObjectId, ref: 'Business', default: null },
  onboardingMeetLink: { type: String },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  registeredByAgentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  subscriptionStatus: { type: String, enum: ['active', 'expired', 'trial', 'cancelled'], default: 'active' },
  subscriptionStart: { type: Date, default: Date.now },
  subscriptionEnd: { type: Date, default: null },
  settings: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    defaultPrice: { type: Number, default: 0 },
    availableHours: [{
      dayOfWeek: { type: Number, required: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      isClosed: { type: Boolean, default: false }
    }]
  }
}, {
  timestamps: true
});

const Business = mongoose.model<IBusiness>('Business', businessSchema);
export default Business;
