import 'dotenv/config';
import nodemailer from 'nodemailer';

export const sendPaymentLinkEmail = async (
  to: string,
  businessName: string,
  planName: string,
  amount: number,
  paymentLink: string
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS is not set in .env. Skipping email sending.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin: 0;">Complete Your Registration</h2>
      </div>
      <div style="padding: 30px 20px;">
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Hello <strong>${businessName}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Your plan selection for <strong>${planName}</strong> has been confirmed. To proceed with your onboarding and activate your shop, please complete your payment of <strong>INR ${amount.toFixed(2)}</strong>.
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${paymentLink}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Pay Now (INR ${amount.toFixed(2)})
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
          If the button above does not work, copy and paste this link into your browser:<br/>
          <a href="${paymentLink}" style="color: #3b82f6; word-break: break-all;">${paymentLink}</a>
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
        This is an automated message, please do not reply.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Superadmin" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Action Required: Complete your payment for ${planName}`,
      html: htmlContent,
    });
    console.log('Payment link email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send payment email:', error);
    throw error;
  }
};

export const sendWelcomeCredentialsEmail = async (params: {
  to: string;
  ownerName: string;
  businessName: string;
  email: string;
  password?: string;
  loginUrl: string;
  isDirectActive: boolean;
}) => {
  const { to, ownerName, businessName, email, password, loginUrl, isDirectActive } = params;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS is not set in .env. Skipping welcome email sending.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #659287; padding: 24px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 24px;">Welcome to Slotify!</h2>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Your business account is ready</p>
      </div>
      <div style="padding: 30px 24px;">
        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-top: 0;">
          Hello <strong>${ownerName}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Your business <strong>${businessName}</strong> has been registered on Slotify by the platform administrator.
          ${
            isDirectActive
              ? 'Your account is active and approved! You can now log in to configure your services, staff, and start accepting online bookings.'
              : 'Your registration has been initiated and is currently in review. You can log in to view your onboarding progress.'
          }
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h4 style="margin: 0 0 12px; color: #1e293b; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Credentials</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #475569;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; width: 100px;">Portal URL:</td>
              <td style="padding: 6px 0;"><a href="${loginUrl}" style="color: #659287; text-decoration: underline;">${loginUrl}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Email:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace;">${email}</td>
            </tr>
            ${
              password
                ? `
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Password:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${password}</td>
            </tr>`
                : ''
            }
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="background-color: #659287; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Log In to Your Dashboard
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
          For security reasons, we recommend updating your password in your account settings after your first login.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
        Slotify Appointment & Booking Platform &bull; Automated System Notification
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Slotify" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Welcome to Slotify - Your Account Credentials for ${businessName}`,
      html: htmlContent,
    });
    console.log('Welcome credentials email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send welcome credentials email:', error);
    // Don't throw to avoid failing the entire registration if SMTP has transient issues
    return null;
  }
};

