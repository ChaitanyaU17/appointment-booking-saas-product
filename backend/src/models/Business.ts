import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  planId?: mongoose.Types.ObjectId;
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
  description: { type: String },
  logo: { type: String },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
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
