import Notification from '../models/Notification';
import Business from '../models/Business';
import Payment from '../models/Payment';
import Appointment from '../models/Appointment';
import User from '../models/User';

interface CreateNotificationOptions {
  title: string;
  message: string;
  type?: 'registration' | 'payment' | 'onboarding' | 'appointment' | 'system';
  recipientRole?: 'Superadmin' | 'Agent' | 'BusinessAdmin';
  recipientId?: any;
  data?: any;
}

export const createNotification = async (opts: CreateNotificationOptions) => {
  try {
    return await Notification.create({
      title: opts.title,
      message: opts.message,
      type: opts.type || 'system',
      recipientRole: opts.recipientRole || 'Superadmin',
      recipientId: opts.recipientId,
      data: opts.data || {},
      read: false
    });
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err);
    return null;
  }
};

/**
 * Automatically backfill notifications from existing records if database has no notifications.
 * This guarantees the user has rich historical data for infinite scrolling from day one.
 */
export const backfillNotificationsIfEmpty = async () => {
  try {
    const count = await Notification.countDocuments();
    if (count > 0) return;

    console.log('[NotificationService] Backfilling notifications from existing database records...');
    const notificationsToInsert: any[] = [];

    // 1. Backfill from real Businesses
    const businesses = await Business.find({ isDemoAccount: { $ne: true } })
      .populate('registeredByAgentId assignedAgentId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    for (const b of businesses) {
      const agent: any = b.registeredByAgentId || b.assignedAgentId;
      const agentName = agent?.name;
      const registeredUserName = (b.ownerName && b.ownerName.trim()) || (b.name && b.name.trim()) || 'New User';

      // Registration notification
      notificationsToInsert.push({
        title: agentName ? 'Agent Registered User' : 'New User Registration',
        message: agentName
          ? `Agent ${agentName} registered user "${registeredUserName}"`
          : `User "${registeredUserName}" was registered via public portal`,
        type: 'registration',
        recipientRole: 'Superadmin',
        data: {
          shopId: b._id,
          shopName: registeredUserName,
          agentId: agent?._id,
          agentName: agentName,
          actionUrl: `/superadmin/registration?biz=${b._id}`,
          stage: b.demoStatus || 'Demo Provisioning'
        },
        read: b.verificationStatus === 'Approved',
        createdAt: b.createdAt || new Date()
      });

      // If approved or trialed
      if (b.verificationStatus === 'Approved') {
        const approvedTime = new Date((b.createdAt ? new Date(b.createdAt).getTime() : Date.now()) + 3600000);
        notificationsToInsert.push({
          title: 'Shop Onboarded & Approved',
          message: `Shop "${b.name}" has completed onboarding and is now active.`,
          type: 'onboarding',
          recipientRole: 'Superadmin',
          data: {
            shopId: b._id,
            shopName: b.name,
            actionUrl: `/superadmin/shops/${b._id}`
          },
          read: true,
          createdAt: approvedTime
        });
      }
    }

    // 2. Backfill from Payments
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(50);
    for (const p of payments) {
      notificationsToInsert.push({
        title: 'Payment Received',
        message: `Payment of ₹${p.amount || 0} received successfully (${(p as any).paymentMethod || 'Online'}).`,
        type: 'payment',
        recipientRole: 'Superadmin',
        data: {
          amount: p.amount,
          actionUrl: '/superadmin/payments'
        },
        read: true,
        createdAt: p.createdAt || new Date()
      });
    }

    // 3. Backfill from Appointments
    const appointments = await Appointment.find()
      .populate('businessId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    for (const a of appointments) {
      const bizName = (a.businessId as any)?.name || 'a platform shop';
      notificationsToInsert.push({
        title: 'New Appointment Booked',
        message: `Customer ${a.customerName || 'Client'} booked an appointment with "${bizName}".`,
        type: 'appointment',
        recipientRole: 'Superadmin',
        data: {
          appointmentId: a._id,
          actionUrl: '/superadmin/appointments'
        },
        read: true,
        createdAt: a.createdAt || new Date()
      });
    }

    if (notificationsToInsert.length > 0) {
      // Sort all by createdAt descending
      notificationsToInsert.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
      await Notification.insertMany(notificationsToInsert);
      console.log(`[NotificationService] Backfilled ${notificationsToInsert.length} notifications.`);
    }
  } catch (err) {
    console.error('[NotificationService] Error backfilling notifications:', err);
  }
};
