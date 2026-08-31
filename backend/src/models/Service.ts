import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  duration: number;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true, default: 30 },
  price: { type: Number, default: 0 },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Service = mongoose.model<IService>('Service', serviceSchema);
export default Service;
