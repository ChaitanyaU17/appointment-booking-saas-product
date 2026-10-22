import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  businessId: mongoose.Types.ObjectId;
  ownerId?: mongoose.Types.ObjectId;
  planId?: mongoose.Types.ObjectId;
  planVariantId?: mongoose.Types.ObjectId | string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  paymentReferenceId?: string;
  paymentToken?: string;
  paymentBreakdown?: any;
  customerSnapshot?: { name?: string; email?: string; phone?: string; };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
  planVariantId: { type: Schema.Types.Mixed },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Success', 'Pending', 'Failed'], default: 'Pending' },
  paymentReferenceId: { type: String },
  paymentToken: { type: String },
  paymentBreakdown: { type: Schema.Types.Mixed },
  customerSnapshot: {
    name: String,
    email: String,
    phone: String
  }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
