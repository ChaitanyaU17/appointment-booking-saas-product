import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import Business from '../models/Business';
import Appointment, { AppointmentStatus, AppointmentType } from '../models/Appointment';
import { generateToken, clearToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<any> => {
  const { name, email, phone, password, businessName, category, registrationNumber, requestedPlanId } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number is already registered' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingBusiness = await Business.findOne({ slug });
    if (existingBusiness) {
      return res.status(400).json({ message: 'Business name is already taken, please choose another' });
    }

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: UserRole.BUSINESS_ADMIN
    });

    const business = new Business({
      name: businessName,
      slug,
      category: category || 'N/A',
      registrationNumber: registrationNumber || 'N/A',
      email,
      phone,
      verificationStatus: 'Pending',
      requestedPlanId: requestedPlanId || null,
      subscriptionStatus: 'trial'
    });

    user.businessId = business._id as mongoose.Types.ObjectId;

    await business.save();
    await user.save();

    generateToken(res, user._id.toString());
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      verificationStatus: business.verificationStatus
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      generateToken(res, user._id.toString());
      
      let verificationStatus = undefined;
      let isDemoAccount = false;
      if (user.role === UserRole.BUSINESS_ADMIN && user.businessId) {
        const business = await Business.findById(user.businessId);
        verificationStatus = business?.verificationStatus;
        isDemoAccount = business?.isDemoAccount || false;
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        verificationStatus,
        isDemoAccount
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  clearToken(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    if (user) {
      let verificationStatus = undefined;
      let isDemoAccount = false;
      if (user.role === UserRole.BUSINESS_ADMIN && user.businessId) {
        const business = await Business.findById(user.businessId);
        verificationStatus = business?.verificationStatus;
        isDemoAccount = business?.isDemoAccount || false;
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        verificationStatus,
        isDemoAccount
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOAuth2Client = () => new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID?.trim(),
  process.env.GOOGLE_CLIENT_SECRET?.trim(),
  process.env.GOOGLE_REDIRECT_URI?.trim()
);

export const getGoogleAuthUrl = (req: Request, res: Response) => {
  const { state } = req.query;
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const url = getOAuth2Client().generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account consent',
    scope: scopes,
    state: state ? String(state) : undefined,
    include_granted_scopes: true,
  });

  res.json({ url });
};

export const googleCallback = async (req: Request, res: Response): Promise<any> => {
  const { code } = req.query;

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const email = userInfo.data.email;
    const name = userInfo.data.name;

    if (!email) {
      return res.status(400).json({ message: 'Google account does not have an email associated' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name || 'Google User',
        email,
        role: UserRole.CUSTOMER,
      });
    }

    if (user.role === UserRole.BUSINESS_ADMIN || user.role === UserRole.CUSTOMER) {
      user.googleCalendarToken = {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || user.googleCalendarToken?.refresh_token,
        expiry_date: tokens.expiry_date!,
        scope: tokens.scope!,
        token_type: tokens.token_type!,
        id_token: tokens.id_token!
      };
    }
    
    await user.save();

    generateToken(res, user._id.toString());

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const stateUrl = req.query.state ? String(req.query.state) : null;
    
    if (user.role === UserRole.CUSTOMER) {
      if (stateUrl && stateUrl.startsWith('/b/')) {
        res.redirect(`${frontendUrl}${stateUrl}`);
      } else {
        res.redirect(`${frontendUrl}/customer/dashboard`);
      }
    } else if (stateUrl && stateUrl.startsWith('/')) {
        res.redirect(`${frontendUrl}${stateUrl}`);
    } else if (user.role === UserRole.SUPERADMIN) {
        res.redirect(`${frontendUrl}/superadmin`);
    } else if (user.role === UserRole.BUSINESS_ADMIN) {
        res.redirect(`${frontendUrl}/business`);
    } else {
        res.redirect(`${frontendUrl}/customer/dashboard`);
    }

  } catch (error) {
    console.error('Error during Google Auth Callback:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};



export const createDemoAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const randomId = Math.floor(Math.random() * 1000000);
    const demoEmail = `demo${randomId}@example.com`;
    const demoSlug = `demo-shop-${randomId}`;

    const business = new Business({
      name: 'Demo Beauty Salon',
      slug: demoSlug,
      category: 'Salon',
      registrationNumber: 'DEMO-123',
      email: demoEmail,
      phone: '1234567890',
      verificationStatus: 'Approved',
      isDemoAccount: true,
      subscriptionStatus: 'active'
    });
    await business.save();

    const hashedPassword = await bcrypt.hash('DemoPassword123!', 10);

    const user = new User({
      name: 'Demo Admin',
      email: demoEmail,
      password: hashedPassword,
      role: UserRole.BUSINESS_ADMIN,
      businessId: business._id,
    });
    await user.save();

    const appointment = new Appointment({
      businessId: business._id,
      title: 'Haircut & Styling',
      creatorRole: UserRole.CUSTOMER,
      customerName: 'sam patil',
      customerEmail: 'sam@example.com',
      customerPhone: '9876543210',
      serviceName: 'Haircut & Styling',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2h
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 3),
      type: AppointmentType.WALK_IN,
      status: AppointmentStatus.CONFIRMED,
      paymentAmount: 800,
    });
    await appointment.save();

    generateToken(res, user._id.toString());
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      verificationStatus: business.verificationStatus,
      isDemoAccount: true
    });
  } catch (error: any) {
    console.error('Error creating demo account:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};
