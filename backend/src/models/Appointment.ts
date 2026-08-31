import mongoose, { Document, Schema } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum AppointmentType {
  WALK_IN = 'Walk-in',
  GOOGLE_MEET = 'Google Meet'
}

export enum CreatorRole {
  CUSTOMER = 'Customer',
  OWNER_ADMIN = 'Owner/Admin'
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  REFUNDED = 'Refunded'
}

export interface IAppointment extends Document {
  businessId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  meetLink?: string;
  eventId?: string;
  creatorRole: CreatorRole;
  price?: number;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING },
  type: { type: String, enum: Object.values(AppointmentType), required: true },
  meetLink: { type: String },
  eventId: { type: String },
  creatorRole: { type: String, enum: Object.values(CreatorRole), required: true },
  price: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
  paymentAmount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
