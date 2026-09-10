import mongoose from 'mongoose';
import { google, Auth } from 'googleapis';
import User, { UserRole } from '../models/User';
import Business from '../models/Business';
import Appointment, { AppointmentStatus } from '../models/Appointment';

const getOAuthClient = async (businessId: string): Promise<Auth.OAuth2Client> => {
  const admin = await User.findOne({ businessId: new mongoose.Types.ObjectId(businessId), role: UserRole.BUSINESS_ADMIN });
  
  if (!admin || !admin.googleCalendarToken) {
    throw new Error('Business is not connected to Google Calendar');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(admin.googleCalendarToken);
  
  return oauth2Client;
};

export const getAvailableSlots = async (businessId: string, dateStr: string) => {
  try {
    const business = await Business.findById(businessId);
    if (!business) throw new Error('Business not found');

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let busySlots: { start: string, end: string }[] = [];

    // Try Google Calendar
    try {
      const oauth2Client = await getOAuthClient(businessId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          timeZone: business.settings.timezone,
          items: [{ id: 'primary' }]
        }
      });
      if (response.data.calendars?.primary.busy) {
        busySlots = response.data.calendars.primary.busy as any;
      }
    } catch (e: any) {
      console.log('Google Calendar not connected or failed, falling back to local DB slots');
    }

    // Get local appointments
    const localAppointments = await Appointment.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      status: { $nin: [AppointmentStatus.CANCELLED, 'Rejected' as any] },
      startTime: { $gte: startOfDay },
      endTime: { $lte: endOfDay }
    });

    localAppointments.forEach(app => {
      busySlots.push({
        start: new Date(app.startTime).toISOString(),
        end: new Date(app.endTime).toISOString()
      });
    });
    
    const dayOfWeek = date.getDay();
    const daySettings = business.settings.availableHours.find(h => h.dayOfWeek === dayOfWeek);

    if (!daySettings || daySettings.isClosed) {
      return { availableSlots: [] };
    }

    const potentialSlots = [];
    const [startHour, startMin] = daySettings.startTime.split(':').map(Number);
    const [endHour, endMin] = daySettings.endTime.split(':').map(Number);
    
    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMin, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0, 0);

    const slotDurationMs = 30 * 60 * 1000;

    while (currentTime.getTime() + slotDurationMs <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + slotDurationMs);
      
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.start!).getTime();
        const busyEnd = new Date(busy.end!).getTime();
        
        return (currentTime.getTime() < busyEnd && slotEnd.getTime() > busyStart);
      });

      if (!isBusy && currentTime.getTime() > new Date().getTime()) {
        potentialSlots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString()
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDurationMs);
    }

    return { availableSlots: potentialSlots };

  } catch (error) {
    console.error('Error fetching free/busy slots:', error);
    throw error;
  }
};

export const createCalendarEvent = async (
  businessId: string, 
  appointmentDetails: any
) => {
  try {
    const oauth2Client = await getOAuthClient(businessId);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const business = await Business.findById(businessId);

    const event: any = {
      summary: appointmentDetails.title,
      description: `
        <h3>${appointmentDetails.title}</h3>
        <p>${appointmentDetails.description || ''}</p>
        <p><b>Customer:</b> ${appointmentDetails.customerName}</p>
        <p><b>Email:</b> ${appointmentDetails.customerEmail}</p>
        <p><b>Phone:</b> ${appointmentDetails.customerPhone}</p>
      `,
      start: {
        dateTime: new Date(appointmentDetails.startTime).toISOString(),
        timeZone: business?.settings.timezone || 'Asia/Kolkata',
      },
      end: {
        dateTime: new Date(appointmentDetails.endTime).toISOString(),
        timeZone: business?.settings.timezone || 'Asia/Kolkata',
      },
    };

    const email = appointmentDetails.customerEmail;
    if (email && email !== 'no-email@example.com' && email.includes('@')) {
      event.attendees = [{ email }];
    }

    if (appointmentDetails.type === 'Google Meet') {
      event.conferenceData = {
        createRequest: {
          requestId: `booking-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      };
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: event,
    });

    return {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink
    };

  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

export const createEventOnCustomerCalendar = async (
  customerEmail: string,
  eventData: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    meetLink?: string;
    businessName: string;
    timezone?: string;
  }
) => {
  try {
    const customer = await User.findOne({ email: customerEmail });
    
    if (!customer || !customer.googleCalendarToken) {
      console.log('Customer does not have Google Calendar token, skipping direct insert');
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(customer.googleCalendarToken);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event: any = {
      summary: `${eventData.title} — ${eventData.businessName}`,
      description: `
        <h3>${eventData.title}</h3>
        <p>Booked with <b>${eventData.businessName}</b></p>
        ${eventData.description ? `<p>${eventData.description}</p>` : ''}
        ${eventData.meetLink ? `<p><b>Google Meet:</b> <a href="${eventData.meetLink}">${eventData.meetLink}</a></p>` : ''}
      `,
      start: {
        dateTime: new Date(eventData.startTime).toISOString(),
        timeZone: eventData.timezone || 'Asia/Kolkata',
      },
      end: {
        dateTime: new Date(eventData.endTime).toISOString(),
        timeZone: eventData.timezone || 'Asia/Kolkata',
      },
    };

    if (eventData.meetLink) {
      event.conferenceData = {
        entryPoints: [{
          entryPointType: 'video',
          uri: eventData.meetLink,
          label: 'Google Meet',
        }],
        conferenceSolution: {
          key: { type: 'hangoutsMeet' },
          name: 'Google Meet',
        },
        conferenceId: `customer-${Date.now()}`,
      };
    }

    await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    });

    console.log(`Event inserted directly into customer's calendar: ${customerEmail}`);
    return true;

  } catch (error) {
    console.error('Error inserting event into customer calendar:', error);
    return null;
  }
};
