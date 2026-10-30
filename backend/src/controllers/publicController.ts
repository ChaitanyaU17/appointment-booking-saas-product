import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Business from '../models/Business';
import Payment from '../models/Payment';
import Appointment, { AppointmentType, CreatorRole } from '../models/Appointment';
import { getAvailableSlots, createCalendarEvent, createEventOnCustomerCalendar } from '../services/googleCalendarService';
import User from '../models/User';
import { isBusinessExpired } from '../utils/businessUtils';
import Service from '../models/Service';
import Plan from '../models/Plan';

export const getPublicPlans = async (req: Request, res: Response): Promise<any> => {
  try {
    const plans = await Plan.find({ isPublic: true }).select('-createdAt -updatedAt').sort({ displayOrder: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const getBusinessBySlug = async (req: Request, res: Response): Promise<any> => {
  try {
    const business = await Business.findOne({ slug: req.params.slug }).select('-createdAt -updatedAt');
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    if (await isBusinessExpired(business)) {
      return res.json({ ...business.toObject(), services: [], isExpired: true });
    }
    const services = await Service.find({ businessId: business._id, isActive: true });
    res.json({ ...business.toObject(), services, isExpired: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAvailableTimeSlots = async (req: Request, res: Response): Promise<any> => {
  try {
    const { slug } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    if (await isBusinessExpired(business)) {
      return res.status(403).json({ message: 'This business subscription is currently expired and not accepting bookings.' });
    }
    if (await isBusinessExpired(business)) {
      return res.status(403).json({ message: 'This business subscription is currently expired and not accepting bookings.' });
    }

    const slots = await getAvailableSlots(business._id.toString(), date as string);
    res.json(slots);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Business is not connected to Google Calendar') {
        res.status(400).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Error fetching slots' });
    }
  }
};

export const getMyUpcomingAppointments = async (req: Request, res: Response): Promise<any> => {
  try {
    const { slug } = req.params;
    const user = (req as any).user;

    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const appointments = await Appointment.find({
      businessId: business._id,
      customerEmail: user.email,
      startTime: { $gte: new Date() }
    }).sort({ startTime: 1 });

    res.json(appointments);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching your appointments' });
  }
};

export const bookAppointment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { slug } = req.params;
    const { customerName, customerEmail, customerPhone, title, description, startTime, endTime, type, price, serviceId } = req.body;

    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    if (await isBusinessExpired(business)) {
      return res.status(403).json({ message: 'This business subscription is currently expired and not accepting bookings.' });
    }

    const serviceCount = await Service.countDocuments({ businessId: business._id });
    if (serviceCount > 0 && !serviceId) {
      return res.status(400).json({ message: 'Please select a service to book an appointment.' });
    }

    let eventDetails = null;

    try {
        eventDetails = await createCalendarEvent(business._id.toString(), {
            title,
            description,
            customerName,
            customerEmail,
            customerPhone,
            startTime,
            endTime,
            type
        });
    } catch (e: any) {
        console.error("Calendar creation failed, but saving local appointment:", e.message);
        if (type === AppointmentType.GOOGLE_MEET) {
             return res.status(400).json({ message: 'Cannot create Google Meet. Business is not connected to Google Calendar.' });
        }
    }

    let customer = await User.findOne({ email: customerEmail });

      const appointment = new Appointment({
      businessId: business._id,
      customerId: customer ? customer._id : undefined,
      serviceId: serviceId || undefined,
      customerName,
      customerEmail,
      customerPhone,
      title,
      description,
      startTime,
      endTime,
      type,
      price,
      creatorRole: CreatorRole.CUSTOMER,
      eventId: eventDetails?.eventId,
      meetLink: eventDetails?.meetLink
    });

    const createdAppointment = await appointment.save();

    if (customerEmail) {
      try {
        await createEventOnCustomerCalendar(customerEmail, {
          title,
          description,
          startTime,
          endTime,
          meetLink: eventDetails?.meetLink || undefined,
          businessName: business.name,
          timezone: business.settings?.timezone
        });
      } catch (e) {
        console.log('Could not insert into customer calendar (non-fatal):', e);
      }
    }

    res.status(201).json(createdAppointment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during booking' });
  }
};

import DemoRequest from '../models/DemoRequest';

export const createDemoRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, mobile, businessName, category, cityState, monthlyAppointments } = req.body;
    const newRequest = new DemoRequest({
      name, mobile, businessName, category, cityState, monthlyAppointments
    });
    await newRequest.save();
    res.status(201).json({ message: 'Demo request submitted successfully' });
  } catch (error) {
    console.error('Error creating demo request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getPaymentDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = String(req.params.token);

    // 1. Try finding business by paymentToken
    let business = await Business.findOne({ paymentToken: token })
      .populate('planId')
      .populate('paymentBreakdown.planId');

    if (business) {
      if (business.paymentStatus === 'Paid') {
        const payment = await Payment.findOne({ businessId: business._id, status: 'Success' }).sort({ createdAt: -1 });
        return res.json({
          isReceipt: true,
          business,
          payment: payment || {
            paymentReferenceId: business.paymentReferenceId,
            paymentBreakdown: business.paymentBreakdown,
            amount: business.paymentBreakdown?.totalAmount || 0,
            status: 'Success',
            createdAt: business.updatedAt,
            customerSnapshot: {
              name: business.name,
              email: business.email,
              phone: business.phone
            }
          }
        });
      }
      return res.json({ business });
    }

    // 2. Try finding by paymentReferenceId (e.g. DUMMY_WOJMNBO or PAY-...)
    const paymentByRef = await Payment.findOne({ paymentReferenceId: token })
      .populate('businessId')
      .populate('planId');

    if (paymentByRef) {
      return res.json({
        isReceipt: true,
        business: paymentByRef.businessId,
        payment: paymentByRef
      });
    }

    const businessByRef = await Business.findOne({ paymentReferenceId: token })
      .populate('planId')
      .populate('paymentBreakdown.planId');

    if (businessByRef) {
      const payment = await Payment.findOne({ businessId: businessByRef._id, status: 'Success' }).sort({ createdAt: -1 });
      return res.json({
        isReceipt: true,
        business: businessByRef,
        payment: payment || {
          paymentReferenceId: businessByRef.paymentReferenceId,
          paymentBreakdown: businessByRef.paymentBreakdown,
          amount: businessByRef.paymentBreakdown?.totalAmount || 0,
          status: 'Success',
          createdAt: businessByRef.updatedAt,
          customerSnapshot: {
            name: businessByRef.name,
            email: businessByRef.email,
            phone: businessByRef.phone
          }
        }
      });
    }

    // 3. Try finding by 24-character ObjectId (can be Payment._id or Business._id)
    if (token && mongoose.Types.ObjectId.isValid(token)) {
      const paymentById = await Payment.findById(token).populate('businessId').populate('planId');
      if (paymentById) {
        return res.json({
          isReceipt: true,
          business: paymentById.businessId,
          payment: paymentById
        });
      }

      // Try as Business ID
      const businessById = await Business.findById(token)
        .populate('planId')
        .populate('paymentBreakdown.planId');

      if (businessById) {
        if (businessById.paymentStatus === 'Paid' || businessById.paymentReferenceId) {
          const payment = await Payment.findOne({ businessId: businessById._id, status: 'Success' }).sort({ createdAt: -1 });
          return res.json({
            isReceipt: true,
            business: businessById,
            payment: payment || {
              paymentReferenceId: businessById.paymentReferenceId,
              paymentBreakdown: businessById.paymentBreakdown,
              amount: businessById.paymentBreakdown?.totalAmount || 0,
              status: 'Success',
              createdAt: businessById.updatedAt,
              customerSnapshot: {
                name: businessById.name,
                email: businessById.email,
                phone: businessById.phone
              }
            }
          });
        }
        return res.json({ business: businessById });
      }
    }

    return res.status(404).json({ message: 'Invalid or expired payment link' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const processPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.params;
    const business = await Business.findOne({ paymentToken: token });
    if (!business) {
      return res.status(404).json({ message: 'Invalid or expired payment link' });
    }
    
    business.paymentStatus = 'Paid';
    business.paymentReferenceId = 'DUMMY_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    business.paymentToken = undefined;
    
    if (business.paymentBreakdown) {
      if (business.paymentBreakdown.planId) business.planId = business.paymentBreakdown.planId;
      if (business.paymentBreakdown.planVariantId) business.planVariantId = business.paymentBreakdown.planVariantId;
      
      const sDate = business.paymentBreakdown.startDate ? new Date(business.paymentBreakdown.startDate) : new Date();
      business.planStartDate = sDate;
      business.subscriptionStart = sDate;
      
      if (business.paymentBreakdown.endDate) {
        const eDate = new Date(business.paymentBreakdown.endDate);
        eDate.setUTCHours(23, 59, 59, 999);
        business.planEndDate = eDate;
        business.subscriptionEnd = eDate;
      }
    }
    
    business.requestedPlanId = undefined;
    business.subscriptionStatus = 'active';
    
    await business.save();

    const snapshot = {
      name: business.name,
      email: business.email,
      phone: business.phone
    };

    const paymentRec = await Payment.findOne({ paymentToken: token, status: 'Pending' });
    if (paymentRec) {
      paymentRec.status = 'Success';
      paymentRec.paymentReferenceId = business.paymentReferenceId;
      paymentRec.paymentToken = undefined;
      paymentRec.customerSnapshot = snapshot;
      await paymentRec.save();
    } else {

      await Payment.create({
        businessId: business._id,
        
        planId: business.planId,
        planVariantId: business.planVariantId,
        amount: business.paymentBreakdown?.totalAmount || 0,
        status: 'Success',
        paymentReferenceId: business.paymentReferenceId,
        paymentBreakdown: business.paymentBreakdown,
        customerSnapshot: snapshot
      });
    }

    res.json({ message: 'Payment successful', referenceId: business.paymentReferenceId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
