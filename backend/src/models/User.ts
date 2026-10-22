import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  SUPERADMIN = 'Superadmin',
  BUSINESS_ADMIN = 'BusinessAdmin',
  CUSTOMER = 'Customer',
  AGENT = 'Agent'
}

export interface IAgentPermissions {
  canManageShopProfile: boolean;
  canManageOnboarding: boolean;
  canManageAppointments: boolean;
  canManageBilling: boolean;
  canAccessRegistration: boolean;
  canAccessOnboardedShops: boolean;
  canAccessExpiredShops: boolean;
  canAccessBusinessAdmins: boolean;
  canAccessPlans: boolean;
  canAccessCoupons: boolean;
  canAccessDemoRequests: boolean;
  canAccessPayments: boolean;
  canRegisterShops: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  businessId?: mongoose.Types.ObjectId;
  originalBusinessId?: mongoose.Types.ObjectId;
  permissions?: IAgentPermissions;
  assignedBusinessIds?: mongoose.Types.ObjectId[];
  isActive?: boolean;
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
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, enum: Object.values(UserRole), required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', default: null },
  originalBusinessId: { type: Schema.Types.ObjectId, ref: 'Business', default: null },
  permissions: {
    canManageShopProfile: { type: Boolean, default: true },
    canManageOnboarding: { type: Boolean, default: true },
    canManageAppointments: { type: Boolean, default: true },
    canManageBilling: { type: Boolean, default: true },
    canAccessRegistration: { type: Boolean, default: true },
    canAccessOnboardedShops: { type: Boolean, default: true },
    canAccessExpiredShops: { type: Boolean, default: false },
    canAccessBusinessAdmins: { type: Boolean, default: false },
    canAccessPlans: { type: Boolean, default: false },
    canAccessCoupons: { type: Boolean, default: false },
    canAccessDemoRequests: { type: Boolean, default: false },
    canAccessPayments: { type: Boolean, default: false },
    canRegisterShops: { type: Boolean, default: true },
  },
  assignedBusinessIds: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
  isActive: { type: Boolean, default: true },
  googleCalendarToken: { type: Object, default: null }
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
