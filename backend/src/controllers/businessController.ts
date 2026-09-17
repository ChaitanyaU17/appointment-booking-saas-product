import { Request, Response } from 'express';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import Business from '../models/Business';
import Appointment, { AppointmentStatus, AppointmentType, PaymentStatus } from '../models/Appointment';
import User from '../models/User';
import Service from '../models/Service';

export const getBusinessDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const businessId = user.businessId;

    const business = await Business.findById(businessId).populate('planId', 'name price');
    if (!business) {
        return res.status(404).json({ message: 'Business not found' });
    }

    const admin = await User.findById(user._id);
    const isGoogleConnected = !!admin?.googleCalendarToken;

    const totalUpcoming = await Appointment.countDocuments({
      businessId: new mongoose.Types.ObjectId(businessId),
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      startTime: { $gte: new Date() }
    });

    const totalCompleted = await Appointment.countDocuments({
      businessId: new mongoose.Types.ObjectId(businessId),
      status: AppointmentStatus.COMPLETED
    });

    const appointmentsToday = await Appointment.countDocuments({
      businessId: new mongoose.Types.ObjectId(businessId),
      startTime: { 
        $gte: new Date(new Date().setHours(0,0,0,0)), 
        $lte: new Date(new Date().setHours(23,59,59,999)) 
      }
    });

    const totalWalkins = await Appointment.countDocuments({
      businessId: new mongoose.Types.ObjectId(businessId),
      type: AppointmentType.WALK_IN
    });

    const totalOnline = await Appointment.countDocuments({
      businessId: new mongoose.Types.ObjectId(businessId),
      type: AppointmentType.GOOGLE_MEET
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const recentAppointments = await Appointment.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      startTime: { $gte: sevenDaysAgo }
    }).select('startTime');

    const dailyBookings: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyBookings[dateStr] = 0;
    }
    
    recentAppointments.forEach(app => {
      const dateStr = new Date(app.startTime).toISOString().split('T')[0];
      if (dailyBookings[dateStr] !== undefined) {
        dailyBookings[dateStr]++;
      }
    });

    const bookingTrend = Object.keys(dailyBookings).sort().map(date => {
      const d = new Date(date);
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count: dailyBookings[date]
      };
    });

    const todayStart = new Date(new Date().setHours(0,0,0,0));
    const todayEnd = new Date(new Date().setHours(23,59,59,999));

    const todaySchedule = await Appointment.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      startTime: { $gte: todayStart, $lte: todayEnd }
    }).sort({ startTime: 1 }).populate('serviceId', 'name');

    const recentBookings = await Appointment.find({
      businessId
    }).sort({ createdAt: -1 }).limit(5).populate('serviceId', 'name');

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const paidAppointments = await Appointment.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      paymentStatus: PaymentStatus.PAID,
      startTime: { $gte: monthStart }
    });

    const revenueMonth = paidAppointments.reduce((sum, app) => sum + (app.paymentAmount || 0), 0);
    const revenueToday = paidAppointments
      .filter(app => new Date(app.startTime) >= todayStart && new Date(app.startTime) <= todayEnd)
      .reduce((sum, app) => sum + (app.paymentAmount || 0), 0);

    const plan = (business.planId as any);
    const trialDaysLeft = business.trialStatus === 'Active' && business.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(business.trialEndsAt).getTime() - Date.now()) / 86400000))
      : null;

    res.json({
      totalUpcoming,
      totalCompleted,
      appointmentsToday,
      totalWalkins,
      totalOnline,
      slug: business.slug,
      isGoogleConnected,
      bookingTrend,
      todaySchedule,
      recentBookings,
      revenueMonth,
      revenueToday,
      trialStatus: business.trialStatus,
      trialDaysLeft,
      planName: plan?.name || null,
      isDemoAccount: business.isDemoAccount,
      onboardingMeetLink: business.onboardingMeetLink,
      typeData: [
        { name: 'Walk-in', value: totalWalkins },
        { name: 'Online', value: totalOnline }
      ],
      statusData: [
        { name: 'Upcoming', value: totalUpcoming },
        { name: 'Completed', value: totalCompleted }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBusinessSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const business = await Business.findById(user.businessId).populate('planId');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const admin = await User.findById(user._id).select('-password');
    const isGoogleConnected = business.isDemoAccount ? true : !!admin?.googleCalendarToken;

    const bookingUrl = `${process.env.FRONTEND_URL}/b/${business.slug}`;
    const qrCode = await QRCode.toDataURL(bookingUrl);

    res.json({
      business,
      admin,
      bookingUrl,
      qrCode,
      isGoogleConnected
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBusinessSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { name, description, logo, settings } = req.body;

    const business = await Business.findById(user.businessId);

    if (business) {
      business.name = name || business.name;
      business.description = description || business.description;
      business.logo = logo || business.logo;
      business.settings = settings || business.settings;

      const updatedBusiness = await business.save();
      res.json(updatedBusiness);
    } else {
      res.status(404).json({ message: 'Business not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Appointments ---
export const getBusinessAppointments = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { status, timeframe, search } = req.query; // timeframe: 'upcoming' or 'past'
    
    let query: any = { businessId: user.businessId };
    
    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { title: searchRegex }
      ];
    }

    if (timeframe === 'upcoming') {
      query.startTime = { $gte: new Date() };
      if (!query.status) {
        query.status = { $ne: 'Completed' };
      }
    } else if (timeframe === 'past') {
      query.endTime = { $lt: new Date() };
    }

    const appointments = await Appointment.find(query).sort({ startTime: 1 }).populate('serviceId', 'name price');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createManualAppointment = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { customerName, customerEmail, customerPhone, title, description, startTime, endTime, type, price } = req.body;

    let eventId;
    try {
      const { createCalendarEvent } = await import('../services/googleCalendarService.js');
      const eventDetails = await createCalendarEvent(user.businessId, {
        title: title || 'Walk-in Appointment',
        description,
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone,
        startTime,
        endTime,
        type: 'Walk-in'
      });
      eventId = eventDetails.eventId;
    } catch (e: any) {
      console.log('Skipping Google Calendar sync for manual appointment:', e.message);
    }

    const appointment = new Appointment({
      businessId: user.businessId,
      customerName,
      customerEmail,
      customerPhone,
      title,
      description,
      startTime,
      endTime,
      type,
      creatorRole: 'Owner/Admin',
      price,
      eventId
    });

    const createdAppointment = await appointment.save();

    if (customerEmail && customerEmail.includes('@')) {
      try {
        const { createEventOnCustomerCalendar } = await import('../services/googleCalendarService.js');
        const business = await Business.findById(user.businessId);
        await createEventOnCustomerCalendar(customerEmail, {
          title: title || 'Walk-in Appointment',
          description,
          startTime,
          endTime,
          businessName: business?.name || 'Business',
          timezone: business?.settings?.timezone
        });
      } catch (e) {
        console.log('Could not insert walk-in into customer calendar (non-fatal):', e);
      }
    }

    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { status } = req.body;
    
    const appointment = await Appointment.findOne({ _id: req.params.id, businessId: user.businessId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const recordPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { amount, status } = req.body;
    
    const appointment = await Appointment.findOne({ _id: req.params.id, businessId: user.businessId });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.paymentStatus = status || 'Paid';
    if (amount) appointment.paymentAmount = amount;
    
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getServices = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const services = await Service.find({ businessId: user.businessId }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createService = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { name, duration, price, description, isActive } = req.body;
    
    const service = new Service({
      businessId: user.businessId,
      name, duration, price, description, isActive
    });
    
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, businessId: user.businessId },
      req.body,
      { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const service = await Service.findOneAndDelete({ _id: req.params.id, businessId: user.businessId });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBusinessPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }

    const business = await Business.findById(user.businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.planId = planId;
    await business.save();

    res.status(200).json({ message: 'Subscription plan updated successfully', planId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resubmitVerification = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { note } = req.body;
    
    const business = await Business.findById(user.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    business.verificationStatus = "Pending";
    business.resubmitNote = note;
    
    await business.save();
    res.json({ message: "Resubmitted for verification", business });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
