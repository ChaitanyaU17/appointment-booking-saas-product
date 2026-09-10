import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  slug: string;
  category: string;
  registrationNumber: string;
  description?: string;
  email?: string;
  phone?: string;
  logo?: string;
  planId?: mongoose.Types.ObjectId;
  
  verificationStatus: 'Pending' | 'ChangesRequested' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  changesRequestedNote?: string;
  resubmitNote?: string;
  requestedPlanId?: mongoose.Types.ObjectId;

  // Superadmin Controlled Trial & Demo Flow
  trialStatus: 'None' | 'Active' | 'Expired' | 'Converted';
  trialPlanId?: mongoose.Types.ObjectId;
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  originalPlanId?: mongoose.Types.ObjectId;
  isDemoAccount?: boolean;
  


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
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, default: 'N/A' },
  registrationNumber: { type: String, default: 'N/A' },
  description: { type: String },
  email: { type: String },
  phone: { type: String },
  logo: { type: String },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },

  verificationStatus: { type: String, enum: ['Pending', 'ChangesRequested', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String },
  changesRequestedNote: { type: String },
  resubmitNote: { type: String },
  requestedPlanId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },

  // Superadmin Controlled Trial & Demo Flow
  trialStatus: { type: String, enum: ['None', 'Active', 'Expired', 'Converted'], default: 'None' },
  trialPlanId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  trialStartedAt: { type: Date },
  trialEndsAt: { type: Date },
  originalPlanId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  isDemoAccount: { type: Boolean, default: false },



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
