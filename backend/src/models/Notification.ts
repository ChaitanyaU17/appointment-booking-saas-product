import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'registration' | 'payment' | 'onboarding' | 'appointment' | 'system';
  recipientRole: 'Superadmin' | 'Agent' | 'BusinessAdmin';
  recipientId?: mongoose.Types.ObjectId;
  data?: {
    shopId?: mongoose.Types.ObjectId;
    shopName?: string;
    agentId?: mongoose.Types.ObjectId;
    agentName?: string;
    amount?: number;
    actionUrl?: string;
    stage?: string;
    appointmentId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['registration', 'payment', 'onboarding', 'appointment', 'system'],
      default: 'system'
    },
    recipientRole: {
      type: String,
      enum: ['Superadmin', 'Agent', 'BusinessAdmin'],
      default: 'Superadmin'
    },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    data: {
      shopId: { type: Schema.Types.ObjectId, ref: 'Business' },
      shopName: { type: String },
      agentId: { type: Schema.Types.ObjectId, ref: 'User' },
      agentName: { type: String },
      amount: { type: Number },
      actionUrl: { type: String },
      stage: { type: String },
      appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' }
    },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, read: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
