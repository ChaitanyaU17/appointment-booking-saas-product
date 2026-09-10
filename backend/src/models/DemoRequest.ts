import mongoose, { Document, Schema } from 'mongoose';

export interface IDemoRequest extends Document {
  name: string;
  mobile: string;
  businessName: string;
  category: string;
  cityState: string;
  monthlyAppointments: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  demoEmail?: string;
  demoPassword?: string;
  createdAt: Date;
  updatedAt: Date;
}

const demoRequestSchema: Schema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  businessName: { type: String, required: true },
  category: { type: String, required: true },
  cityState: { type: String, required: true },
  monthlyAppointments: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  demoEmail: { type: String },
  demoPassword: { type: String },
}, { timestamps: true });

export default mongoose.model<IDemoRequest>('DemoRequest', demoRequestSchema);
