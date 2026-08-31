import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
import User, { UserRole } from '../models/User';
import { generateToken, clearToken } from '../utils/jwt';

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      generateToken(res, user._id.toString());
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId
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
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId
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
