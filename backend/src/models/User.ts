import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  SUPERADMIN = 'Superadmin',
  BUSINESS_ADMIN = 'BusinessAdmin',
  CUSTOMER = 'Customer'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  businessId?: mongoose.Types.ObjectId;
  googleCalendarToken?: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
    scope?: string;
    token_type?: string;
    id_token?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: Object.values(UserRole), required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', default: null },
  googleCalendarToken: { type: Object, default: null }
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
