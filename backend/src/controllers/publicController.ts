import { Request, Response } from 'express';
import Business from '../models/Business';
import Appointment, { AppointmentType, CreatorRole } from '../models/Appointment';
import { getAvailableSlots, createCalendarEvent, createEventOnCustomerCalendar } from '../services/googleCalendarService';
import User from '../models/User';

import Service from '../models/Service';
import Plan from '../models/Plan';

export const getPublicPlans = async (req: Request, res: Response): Promise<any> => {
  try {
    const plans = await Plan.find({ isActive: true }).select('-createdAt -updatedAt').sort({ displayOrder: 1 });
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
    const services = await Service.find({ businessId: business._id, isActive: true });
    res.json({ ...business.toObject(), services });
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
      serviceId,
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
