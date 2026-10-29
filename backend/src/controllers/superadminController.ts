import mongoose from 'mongoose';
import DemoRequest from '../models/DemoRequest';
import Appointment, { AppointmentStatus, AppointmentType } from '../models/Appointment';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import Business from '../models/Business';
import Payment from '../models/Payment';
import { sendPaymentLinkEmail, sendWelcomeCredentialsEmail } from '../utils/emailService';
import Plan from '../models/Plan';
import Service from '../models/Service';
import Notification from '../models/Notification';
import { backfillNotificationsIfEmpty, createNotification } from '../utils/notificationService';

export const cleanupDemoSandbox = async (business: any) => {
  if (business.demoBusinessId) {
    const adminUser = await User.findOne({ originalBusinessId: business._id });
    if (adminUser) {
      adminUser.businessId = adminUser.originalBusinessId;
      adminUser.originalBusinessId = undefined;
      await adminUser.save();
    }
    await Appointment.deleteMany({ businessId: business.demoBusinessId });
    await Service.deleteMany({ businessId: business.demoBusinessId });
    await Business.findByIdAndDelete(business.demoBusinessId);
    business.demoBusinessId = undefined;
    business.demoStatus = 'None';
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalBusinesses = await Business.countDocuments({ isDemoAccount: { $ne: true } });
    const registeredShops = await Business.countDocuments({ verificationStatus: 'Approved', isDemoAccount: { $ne: true } });
    const pendingShops = await Business.countDocuments({ verificationStatus: { $in: ['Pending', 'ChangesRequested'] }, isDemoAccount: { $ne: true } });
    const rejectedShops = await Business.countDocuments({ verificationStatus: 'Rejected', isDemoAccount: { $ne: true } });
    const totalAdmins = await User.countDocuments({ role: UserRole.BUSINESS_ADMIN });
    const totalAppointments = await Appointment.countDocuments();
    const activeTrials = await Business.countDocuments({ trialStatus: 'Active', isDemoAccount: { $ne: true } });
    const totalDemoRequests = await DemoRequest.countDocuments();
    const pendingDemoRequests = await DemoRequest.countDocuments({ status: 'Pending' });
    const approvedDemoRequests = await DemoRequest.countDocuments({ status: 'Approved' });
    const rejectedDemoRequests = await DemoRequest.countDocuments({ status: 'Rejected' });

    const totalPaymentsCount = await Payment.countDocuments();
    const successPaymentsCount = await Payment.countDocuments({ status: 'Success' });
    const confirmedAppointments = await Appointment.countDocuments({ status: AppointmentStatus.CONFIRMED });
    const completedAppointments = await Appointment.countDocuments({ status: AppointmentStatus.COMPLETED });
    const pendingAppointments = await Appointment.countDocuments({ status: AppointmentStatus.PENDING });
    const cancelledAppointments = await Appointment.countDocuments({ status: AppointmentStatus.CANCELLED });

    // Agent registered shop metrics
    const agentRegisteredTotal = await Business.countDocuments({
      registeredByAgentId: { $ne: null },
      isDemoAccount: { $ne: true }
    });
    const agentRegisteredPending = await Business.countDocuments({
      registeredByAgentId: { $ne: null },
      verificationStatus: { $in: ['Pending', 'ChangesRequested'] },
      isDemoAccount: { $ne: true }
    });
    const agentRegisteredApproved = await Business.countDocuments({
      registeredByAgentId: { $ne: null },
      verificationStatus: 'Approved',
      isDemoAccount: { $ne: true }
    });

    // Onboarding pipeline breakdown
    const pendingFilter: any = { verificationStatus: { $in: ['Pending', 'ChangesRequested'] }, isDemoAccount: { $ne: true } };
    const demoProvisioningCount = await Business.countDocuments({
      ...pendingFilter,
      $or: [{ demoStatus: 'None' }, { demoStatus: { $exists: false } }, { demoStatus: null }]
    } as any);
    const demoConductedCount = await Business.countDocuments({
      ...pendingFilter,
      demoStatus: 'Provided'
    } as any);
    const planSelectionCount = await Business.countDocuments({
      ...pendingFilter,
      demoStatus: 'Conducted',
      planId: { $in: [null, undefined] },
      paymentStatus: { $ne: 'Paid' }
    } as any);
    const verificationDecisionCount = await Business.countDocuments({
      ...pendingFilter,
      demoStatus: 'Conducted',
      $or: [
        { planId: { $ne: null } },
        { paymentStatus: 'Paid' }
      ]
    } as any);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const appointmentsToday = await Appointment.countDocuments({
      startTime: { $gte: startOfToday, $lte: endOfToday }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const trendData = await Appointment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const typeData = await Appointment.aggregate([
      {
        $group: {
          _id: "$type",
          value: { $sum: 1 }
        }
      }
    ]);

    const successPayments = await Payment.find({ status: 'Success' });
    
    let grossCollections = 0;
    let totalRevenue = 0;
    
    let last30Revenue = 0;
    let prev30Revenue = 0;
    
    successPayments.forEach(p => {
        const gross = p.amount || 0;
        const gst = p.paymentBreakdown?.gstAmount || 0;
        const net = gross - gst;
        
        grossCollections += gross;
        totalRevenue += net;
        
        const date = new Date(p.createdAt);
        if (date >= thirtyDaysAgo) {
            last30Revenue += net;
        } else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) {
            prev30Revenue += net;
        }
    });

    let revenueTrend = 0;
    if (prev30Revenue > 0) {
        revenueTrend = ((last30Revenue - prev30Revenue) / prev30Revenue) * 100;
    } else if (last30Revenue > 0) {
        revenueTrend = 100;
    }

    const recentPayments = await Payment.find()
      .populate('businessId', 'name')
      .populate('planId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentBusinesses = await Business.find({ isDemoAccount: { $ne: true } }).populate('registeredByAgentId', 'name email phone').sort({ createdAt: -1 }).limit(6);
    const recentAdmins = await User.find({ role: UserRole.BUSINESS_ADMIN }).sort({ createdAt: -1 }).limit(5);

    const recentActivity = [
      ...recentBusinesses.map(b => {
        const agent = b.registeredByAgentId as any;
        const agentName = agent ? agent.name : null;
        return {
          id: b._id,
          type: agentName ? 'agent_registration' : 'business',
          message: agentName 
            ? `Agent '${agentName}' registered shop '${b.name}'` 
            : `New business '${b.name}' created`,
          date: (b as any).createdAt || new Date(),
          agentName: agentName || null,
          businessName: b.name,
          businessId: b._id
        };
      }),
      ...recentAdmins.map(a => ({
        id: a._id,
        type: 'admin',
        message: `New admin '${a.name}' registered`,
        date: (a as any).createdAt || new Date()
      })),
      ...recentPayments.filter(p => p.status === 'Success').map(p => ({
        id: p._id,
        type: 'payment',
        message: `Received ₹${p.amount?.toFixed(2)} from '${(p.businessId as any)?.name || 'Unknown'}'`,
        date: (p as any).createdAt || new Date()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

    res.json({
      totalBusinesses,
      registeredShops,
      pendingShops,
      rejectedShops,
      agentRegisteredStats: {
        total: agentRegisteredTotal,
        pending: agentRegisteredPending,
        approved: agentRegisteredApproved
      },
      onboardingStages: {
        demoProvisioning: demoProvisioningCount,
        demoConducted: demoConductedCount,
        planSelection: planSelectionCount,
        verificationDecision: verificationDecisionCount
      },
      pendingDemoRequests,
      demoRequestStats: {
        total: totalDemoRequests,
        pending: pendingDemoRequests,
        approved: approvedDemoRequests,
        rejected: rejectedDemoRequests
      },
      totalAdmins,
      totalAppointments,
      appointmentStats: {
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        pending: pendingAppointments,
        cancelled: cancelledAppointments
      },
      paymentStats: {
        total: totalPaymentsCount,
        success: successPaymentsCount
      },
      activeTrials,
      appointmentsToday,
      totalRevenue,
      grossCollections,
      revenueTrend,
      recentPayments,
      trendData: trendData.map(d => ({ date: d._id, count: d.count })),
      typeData: typeData.map(d => ({ name: d._id, value: d.value })),
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBusinesses = async (req: Request, res: Response): Promise<any> => {
  try {
    const businesses = await Business.find({ isDemoAccount: { $ne: true } })
      .populate('planId', 'name slug price')
      .populate('requestedPlanId', 'name')
      .populate('registeredByAgentId', 'name email phone')
      .populate('assignedAgentId', 'name email phone')
      .lean();
    
    // Fetch all business admins to map owner names
    const admins = await User.find({ role: UserRole.BUSINESS_ADMIN }, 'name email phone businessId originalBusinessId').lean();
    
    // Fetch stats for each business
    const businessesWithOwnerAndStats = await Promise.all(businesses.map(async (b) => {
      const admin = admins.find(a => a.businessId?.toString() === b._id.toString() || a.originalBusinessId?.toString() === b._id.toString());
      
      const appointmentsCount = await Appointment.find({ businessId: b._id as any }).countDocuments();
      const walkinsCount = await Appointment.find({ businessId: b._id as any, type: 'Walk-in' as any }).countDocuments();
      const servicesCount = await Service.find({ businessId: b._id as any }).countDocuments();
      
      return {
        ...b,
        ownerName: (b as any).ownerName || admin?.name || null,
        ownerEmail: admin?.email || null,
        ownerPhone: admin?.phone || null,
        stats: {
          appointments: appointmentsCount,
          walkins: walkinsCount,
          services: servicesCount
        }
      };
    }));

    res.json(businessesWithOwnerAndStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBusiness = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, slug, description, email, phone, category, registrationNumber, settings, planId } = req.body;
    
    const businessExists = await Business.findOne({ slug });
    if (businessExists) {
      return res.status(400).json({ message: 'Business slug already exists' });
    }

    let assignedPlanId = planId || null;
    if (!assignedPlanId) {
      const defaultPlan = await Plan.findOne({ isDefault: true, isActive: true });
      if (defaultPlan) {
        assignedPlanId = defaultPlan._id;
      }
    }

    const business = new Business({
      name,
      slug,
      email,
      phone,
      ownerName: req.body.ownerName || 'N/A',
      category: category || 'N/A',
      registrationNumber: registrationNumber || 'N/A',
      description,
      settings,
      planId: assignedPlanId,
    });

    const createdBusiness = await business.save();
    const populated = await createdBusiness.populate('planId', 'name slug price');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBusiness = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, slug, description, email, phone, category, registrationNumber, settings, verificationStatus, rejectionReason, changesRequestedNote, planId, subscriptionStatus } = req.body;

    const business = await Business.findById(id);

    if (business) {
      const oldBizName = business.name;
      if (name) business.name = name.trim();
      
      if (slug && slug.trim()) {
        business.slug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '');
      } else if (name && name.trim() && (name.trim() !== oldBizName || !business.slug || business.slug.startsWith('shop-'))) {
        let baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (!baseSlug) {
          baseSlug = `shop-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        let finalSlug = baseSlug;
        const slugExists = await Business.findOne({ slug: finalSlug, _id: { $ne: business._id } });
        if (slugExists) {
          finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        business.slug = finalSlug;
      }

      if (req.body.ownerName) business.ownerName = req.body.ownerName.trim();
      business.description = description || business.description;
      if (email !== undefined) business.email = email;
      if (phone !== undefined) business.phone = phone;
      if (category) business.category = category;
      if (registrationNumber) business.registrationNumber = registrationNumber;
      if (settings) business.settings = settings;
      if (req.body.planVariantId !== undefined) business.planVariantId = req.body.planVariantId;
      if (req.body.planStartDate !== undefined) business.planStartDate = req.body.planStartDate;
      if (req.body.planEndDate !== undefined) business.planEndDate = req.body.planEndDate;
      if (req.body.subscriptionStart !== undefined) business.subscriptionStart = req.body.subscriptionStart;
      if (req.body.subscriptionEnd !== undefined) business.subscriptionEnd = req.body.subscriptionEnd;
      if (req.body.clearRequestedPlan) business.requestedPlanId = undefined;
      if (req.body.paymentStatus !== undefined) business.paymentStatus = req.body.paymentStatus;
      if (req.body.paymentBreakdown !== undefined) business.paymentBreakdown = req.body.paymentBreakdown;
      if (req.body.paymentBreakdown === null) business.paymentBreakdown = undefined;
      
      if (planId !== undefined) {
        business.planId = planId;
        // If manually assigning a plan, clear any active trial
        if (business.trialStatus === "Active") {
          business.trialStatus = "Converted";
          business.trialEndsAt = undefined;
          business.trialStartedAt = undefined;
        }

        if (req.body.planEndDate === undefined && req.body.subscriptionEnd === undefined) {
          const planDoc = await Plan.findById(planId);
          if (planDoc) {
            const targetVariantId = req.body.planVariantId || business.planVariantId;
            const variant = planDoc.variants?.find((v) => String(v._id) === String(targetVariantId)) || planDoc.variants?.[0];
            const durationDays = variant?.durationDays || (planDoc as any).durationDays || 30;
            const now = new Date();
            business.planStartDate = now;
            business.subscriptionStart = now;
            if (variant?.billingCycle === 'one-time' || (planDoc as any).isPermanent) {
              business.planEndDate = undefined;
              business.subscriptionEnd = undefined;
            } else {
              const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
              business.planEndDate = endDate;
              business.subscriptionEnd = endDate;
            }
            business.subscriptionStatus = 'active';
          }
        }
      }
      if (verificationStatus) business.verificationStatus = verificationStatus;

      if (!business.category) business.category = 'N/A';
      if (!business.registrationNumber) business.registrationNumber = 'N/A';

      const updatedBusiness = await business.save();
      const populated = await updatedBusiness.populate('planId', 'name slug price');
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Business not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBusiness = async (req: Request, res: Response): Promise<any> => {
  try {
    const business = await Business.findById(req.params.id);
    if (business) {
      await cleanupDemoSandbox(business);
      await business.deleteOne();
      await Promise.all([
        User.deleteMany({
          $or: [
            { businessId: business._id },
            { originalBusinessId: business._id }
          ]
        }),
        Appointment.deleteMany({ businessId: business._id }),
        Service.deleteMany({ businessId: business._id }),
        Payment.deleteMany({ businessId: business._id }),
        User.updateMany(
          { assignedBusinessIds: business._id },
          { $pull: { assignedBusinessIds: business._id } }
        )
      ]);
      res.json({ message: 'Business removed' });
    } else {
      res.status(404).json({ message: 'Business not found' });
    }
  } catch (error: any) {
    console.error('Error deleting business:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getBusinessAdmins = async (req: Request, res: Response): Promise<any> => {
  try {
    const admins = await User.find({ role: UserRole.BUSINESS_ADMIN })
      .populate('businessId', 'name slug ownerName')
      .select('-password');
    res.json(admins);
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createBusinessAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, businessId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: UserRole.BUSINESS_ADMIN,
      businessId
    });

    const createdUser = await user.save();

    if (businessId) {
      const biz = await Business.findById(businessId);
      if (biz) {
        if (!biz.ownerName || biz.ownerName === 'N/A') {
          biz.ownerName = name.trim();
        }
        if (!biz.name) {
          biz.name = name.trim();
          let baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          if (baseSlug) {
            let finalSlug = baseSlug;
            const conflict = await Business.findOne({ slug: finalSlug, _id: { $ne: biz._id } });
            if (conflict) finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
            biz.slug = finalSlug;
          }
        }
        await biz.save();
      }
    }

    const populated = await User.findById(createdUser._id)
      .populate('businessId', 'name slug ownerName')
      .select('-password');
    res.status(201).json(populated || createdUser);
  } catch (error: any) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateBusinessAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, email, password, businessId } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldName = user.name;
    const oldEmail = user.email;

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (businessId) user.businessId = businessId;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    // Synchronize linked Business document (e.g. agent registered user/shop)
    const targetBusinessId = user.businessId || (user as any).originalBusinessId || businessId;
    let business = targetBusinessId ? await Business.findById(targetBusinessId) : null;
    if (!business) {
      business = await Business.findOne({
        $or: [
          { email: oldEmail },
          { email: user.email }
        ]
      });
    }

    if (business) {
      if (name && name.trim()) {
        const trimmedName = name.trim();
        business.ownerName = trimmedName;

        // If business name was empty, or equal to old user name, keep business name in sync
        if (!business.name || business.name.trim() === '' || business.name === oldName) {
          business.name = trimmedName;
        }

        // Regenerate unique slug according to the updated name
        let baseSlug = (business.name || trimmedName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        if (!baseSlug) {
          baseSlug = `shop-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        let finalSlug = baseSlug;
        const slugExists = await Business.findOne({
          slug: finalSlug,
          _id: { $ne: business._id }
        });
        if (slugExists) {
          finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        business.slug = finalSlug;
      }

      if (email && email.trim()) {
        business.email = email.trim().toLowerCase();
      }

      await business.save();
    }

    const populatedUser = await User.findById(updatedUser._id)
      .populate('businessId', 'name slug ownerName')
      .select('-password');

    res.json(populatedUser || updatedUser);
  } catch (error: any) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteBusinessAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: id });
    res.json({ message: 'User removed' });
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const approveBusiness = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { planId, planVariantId, discountPercentage } = req.body;
    
    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    if (business.demoStatus !== 'Conducted') {
      return res.status(400).json({ message: 'Please mark the demo as conducted before approving.' });
    }

    // Cleanup demo sandbox: swap user back to real business and delete demo data
    await cleanupDemoSandbox(business);

    business.verificationStatus = 'Approved';
    business.demoStatus = 'Conducted';
    
    if (planId) business.planId = planId;
    if (planVariantId) business.planVariantId = planVariantId;
    if (discountPercentage !== undefined) business.discountPercentage = discountPercentage;

    const targetPlanId = planId || business.planId;
    if (targetPlanId) {
      const planDoc = await Plan.findById(targetPlanId);
      if (planDoc) {
        const targetVariantId = planVariantId || business.planVariantId;
        const variant = planDoc.variants?.find((v) => String(v._id) === String(targetVariantId)) || planDoc.variants?.[0];
        const durationDays = variant?.durationDays || (planDoc as any).durationDays || 30;
        const now = new Date();
        business.planStartDate = now;
        business.subscriptionStart = now;
        if (variant?.billingCycle === 'one-time' || (planDoc as any).isPermanent) {
          business.planEndDate = undefined;
          business.subscriptionEnd = undefined;
        } else {
          const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
          business.planEndDate = endDate;
          business.subscriptionEnd = endDate;
        }
        business.subscriptionStatus = 'active';
      }
    }

    // Fix for legacy documents missing required fields
    if (!business.category) business.category = 'N/A';
    if (!business.registrationNumber) business.registrationNumber = 'N/A';
    
    await business.save();
    res.json({ message: 'Business approved', business });
  } catch (error: any) {
    console.error('Error approving business:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const rejectBusiness = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    business.verificationStatus = 'Rejected';
    business.rejectionReason = reason;

    await cleanupDemoSandbox(business);

    if (!business.category) business.category = 'N/A';
    if (!business.registrationNumber) business.registrationNumber = 'N/A';
    
    await business.save();
    res.json({ message: 'Business rejected', business });
  } catch (error: any) {
    console.error('Error rejecting business:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const requestBusinessChanges = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    business.verificationStatus = 'ChangesRequested';
    business.changesRequestedNote = note;

    await cleanupDemoSandbox(business);

    if (!business.category) business.category = 'N/A';
    if (!business.registrationNumber) business.registrationNumber = 'N/A';
    
    await business.save();
    res.json({ message: 'Changes requested', business });
  } catch (error: any) {
    console.error('Error requesting changes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const activateTrial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { planId, durationDays, isPermanent } = req.body;
    
    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (business.demoStatus !== 'Conducted') {
      return res.status(400).json({ message: 'Please mark the demo as conducted before activating trial.' });
    }

    // Cleanup demo sandbox: swap user back to real business and delete demo data
    await cleanupDemoSandbox(business);
    business.demoStatus = 'Conducted';

    // Activating a trial automatically approves the business if it's still pending
    if (business.verificationStatus !== 'Approved') {
      business.verificationStatus = 'Approved';
    }

    if (!business.category) business.category = "N/A";
    if (!business.registrationNumber) business.registrationNumber = "N/A";

    if (isPermanent) {
      business.planId = planId;
      business.trialStatus = "Converted";
      business.trialStartedAt = undefined;
      business.trialEndsAt = undefined;
      business.planStartDate = new Date();
      business.subscriptionStart = new Date();
      business.planEndDate = undefined;
      business.subscriptionEnd = undefined;
      business.subscriptionStatus = 'active';
      await business.save();
      return res.json({ message: "Plan assigned permanently", business });
    }

    // Fix #4: Only save originalPlanId if there is no active trial already (prevents chain overwrite)
    if (business.trialStatus !== 'Active') {
      business.originalPlanId = business.planId;
    }
    business.planId = planId;
    business.trialStatus = "Active";
    business.trialStartedAt = new Date();
    
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + Number(durationDays));
    business.trialEndsAt = endsAt;
    business.planStartDate = business.trialStartedAt;
    business.planEndDate = endsAt;
    business.subscriptionStart = business.trialStartedAt;
    business.subscriptionEnd = endsAt;
    business.subscriptionStatus = 'trial';

    await business.save();
    res.json({ message: "Trial activated successfully", business });
  } catch (error: any) {
    console.error("Error activating trial:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const createDemoForRegistration = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { meetLink } = req.body;

    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    if (business.demoStatus === 'Provided') {
      return res.status(400).json({ message: 'Demo has already been provided for this business.' });
    }

    // Find the admin user linked to this business
    const adminUser = await User.findOne({ businessId: business._id, role: UserRole.BUSINESS_ADMIN });
    if (!adminUser) return res.status(404).json({ message: 'No admin user found for this business.' });

    const randomId = Math.floor(Math.random() * 100000);
    const demoSlug = `demo-${business.slug}-${randomId}`;

    // Create demo sandbox business
    const demoBusiness = new Business({
      name: `Demo - ${business.name}`,
      slug: demoSlug,
      category: business.category || 'N/A',
      registrationNumber: `DEMO-${randomId}`,
      email: adminUser.email,
      phone: business.phone,
      verificationStatus: 'Approved',
      isDemoAccount: true,
      onboardingMeetLink: meetLink,
      subscriptionStatus: 'active',
      settings: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        defaultPrice: 0,
        availableHours: [
          { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isClosed: true },
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isClosed: false },
          { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isClosed: false },
          { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isClosed: false },
          { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isClosed: false },
          { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isClosed: false },
          { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isClosed: false },
        ]
      }
    });
    await demoBusiness.save();

    // Seed sample services
    const sampleServices = [
      { businessId: demoBusiness._id, name: 'Haircut & Styling', duration: 30, price: 300, description: 'Professional haircut with wash and style', isActive: true },
      { businessId: demoBusiness._id, name: 'Facial Treatment', duration: 45, price: 500, description: 'Deep cleansing facial with moisturizing', isActive: true },
      { businessId: demoBusiness._id, name: 'Hair Coloring', duration: 60, price: 800, description: 'Full hair coloring with premium products', isActive: true },
    ];
    await Service.insertMany(sampleServices);

    // Seed sample appointments
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowPlusOne = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const sampleAppointments = [
      {
        businessId: demoBusiness._id,
        title: 'Haircut & Styling',
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul@example.com',
        customerPhone: '9876543210',
        startTime: twoHoursLater,
        endTime: threeHoursLater,
        type: AppointmentType.WALK_IN,
        status: AppointmentStatus.CONFIRMED,
        creatorRole: 'Customer',
        price: 300,
      },
      {
        businessId: demoBusiness._id,
        title: 'Facial Treatment',
        customerName: 'Priya Patel',
        customerEmail: 'priya@example.com',
        customerPhone: '9876543211',
        startTime: tomorrow,
        endTime: tomorrowPlusOne,
        type: AppointmentType.WALK_IN,
        status: AppointmentStatus.PENDING,
        creatorRole: 'Customer',
        price: 500,
      },
    ];
    await Appointment.insertMany(sampleAppointments);

    // Swap user's businessId to demo sandbox
    adminUser.originalBusinessId = adminUser.businessId;
    adminUser.businessId = demoBusiness._id as mongoose.Types.ObjectId;
    await adminUser.save();

    // Update original business to track demo status
    business.demoStatus = 'Provided';
    business.demoBusinessId = demoBusiness._id as mongoose.Types.ObjectId;
    if (meetLink) {
      business.onboardingMeetLink = meetLink;
    }
    await business.save();

    res.json({ message: 'Demo provided successfully. The user can now log in with their existing credentials to explore the app.', demoBusinessName: demoBusiness.name });
  } catch (error: any) {
    console.error('Error creating demo for registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markDemoConducted = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    if (business.demoStatus !== 'Provided') {
      return res.status(400).json({ message: 'Demo has not been provided yet.' });
    }

    business.demoStatus = 'Conducted';
    await business.save();

    res.json({ message: 'Demo marked as conducted successfully.', business });
  } catch (error: any) {
    console.error('Error marking demo as conducted:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getDemoRequests = async (req: Request, res: Response): Promise<any> => {
  try {
    const requests = await DemoRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveDemoRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const request = await DemoRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Already processed' });

    const randomId = Math.floor(Math.random() * 100000);
    const demoEmail = `demo${randomId}@example.com`;
    const demoPassword = `Demo${randomId}!`;
    const hashedPassword = await bcrypt.hash(demoPassword, 10);
    const demoSlug = `demo-${randomId}`;

    request.status = 'Approved';
    request.demoEmail = demoEmail;
    request.demoPassword = demoPassword;
    if (req.body.meetLink) {
      request.meetLink = req.body.meetLink;
    }
    await request.save();

    const business = new Business({
      name: request.businessName,
      slug: demoSlug,
      category: request.category,
      registrationNumber: 'DEMO-' + randomId,
      email: demoEmail,
      phone: request.mobile,
      verificationStatus: 'Approved',
      isDemoAccount: true,
      onboardingMeetLink: req.body.meetLink,
      subscriptionStatus: 'active'
    });
    await business.save();

    const user = new User({
      name: request.name,
      email: demoEmail,
      password: hashedPassword,
      role: UserRole.BUSINESS_ADMIN,
      businessId: business._id,
    });
    await user.save();

    const appointment = new Appointment({
      businessId: business._id,
      title: 'Demo Appointment',
      creatorRole: UserRole.CUSTOMER,
      customerName: 'Example Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '1234567890',
      serviceName: 'Example Service',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 3),
      type: AppointmentType.WALK_IN,
      status: AppointmentStatus.CONFIRMED,
      paymentAmount: 0,
    });
    await appointment.save();

    res.json({ email: demoEmail, password: demoPassword });
  } catch (error: any) {
    console.error('approveDemoRequest error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const rejectDemoRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const request = await DemoRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'Rejected';
    await request.save();
    res.json({ message: 'Rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDemoRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const request = await DemoRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const generatePaymentLink = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    const token = (business.paymentToken && business.paymentStatus === 'Pending') ? business.paymentToken : Math.random().toString(36).substring(2, 15);
    business.paymentToken = token;
    business.paymentLinkGeneratedAt = new Date();
    business.paymentStatus = 'Pending';
    
    business.paymentBreakdown = req.body.paymentBreakdown || business.paymentBreakdown;
    
    await business.save();
    
    const paymentLinkFull = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${token}`;
    
    if (business.email) {
      try {
        const planName = business.paymentBreakdown?.planName || 'your selected plan';
        const totalAmount = business.paymentBreakdown?.totalAmount || 0;
        await sendPaymentLinkEmail(business.email, business.name, planName, totalAmount, paymentLinkFull);
        console.log(`Payment link successfully emailed to: ${business.email}`);
      } catch (err) {
        console.error('Email failed:', err);
      }
    }
    
    res.json({ paymentLink: `/pay/${token}`, business, emailSent: !!business.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPayments = async (req: Request, res: Response): Promise<any> => {
  try {
    const payments = await Payment.find()
      .populate('businessId', 'name phone email')
      .populate('ownerId', 'name email')
      .populate('planId', 'name')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const registerBusinessByAdmin = async (req: Request, res: Response): Promise<any> => {
  const {
    name,
    ownerName,
    email,
    ownerEmail,
    phone,
    ownerPhone,
    password,
    additionalNotes,
    businessName,
    sendWelcomeEmail
  } = req.body;

  try {
    const finalOwnerName = (name || ownerName || '').trim();
    const finalEmail = (email || ownerEmail || '').toLowerCase().trim();
    const finalPhone = (phone || ownerPhone || '').trim();
    const finalBusinessName = (businessName || finalOwnerName || 'New Shop').trim();

    if (!finalOwnerName || !finalEmail) {
      return res.status(400).json({ message: 'Owner name and email are required' });
    }

    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    if (finalPhone) {
      const existingPhone = await User.findOne({ phone: finalPhone });
      if (existingPhone) {
        return res.status(400).json({ message: 'A user with this phone number already exists' });
      }
    }

    // Resolve Slug
    let baseSlug = finalBusinessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!baseSlug) {
      baseSlug = `shop-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    let finalSlug = baseSlug;
    const slugExists = await Business.findOne({ slug: finalSlug });
    if (slugExists) {
      finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Resolve Password (manual enter, or fallback)
    const rawPassword = (password || '').trim() || 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Directly Approved & Active on Onboarded Shops
    const business = new Business({
      name: finalBusinessName,
      slug: finalSlug,
      category: 'General',
      registrationNumber: 'N/A',
      additionalNotes: additionalNotes || '',
      description: additionalNotes || '',
      email: finalEmail,
      phone: finalPhone || 'N/A',
      ownerName: finalOwnerName,
      verificationStatus: 'Approved',
      subscriptionStatus: 'active',
      trialStatus: 'None',
      planStartDate: new Date(),
    });

    await business.save();

    // Create User (BusinessAdmin)
    let user: any;
    try {
      user = new User({
        name: finalOwnerName,
        email: finalEmail,
        phone: finalPhone || undefined,
        password: hashedPassword,
        role: UserRole.BUSINESS_ADMIN,
        businessId: business._id
      });
      await user.save();

      await createNotification({
        title: 'New Shop Registration',
        message: `Shop "${business.name}" registered by Superadmin.`,
        type: 'registration',
        recipientRole: 'Superadmin',
        data: {
          shopId: business._id,
          shopName: business.name,
          actionUrl: `/superadmin/registration?biz=${business._id}`,
          stage: 'Demo Provisioning'
        }
      });
    } catch (userErr: any) {
      await Business.findByIdAndDelete(business._id);
      throw userErr;
    }

    // Optional email dispatch
    if (sendWelcomeEmail !== false) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const loginUrl = `${frontendUrl}/login`;
        await sendWelcomeCredentialsEmail({
          to: finalEmail,
          ownerName: finalOwnerName,
          businessName: finalBusinessName,
          email: finalEmail,
          password: rawPassword,
          loginUrl,
          isDirectActive: true
        });
      } catch (emailErr) {
        console.error('Non-critical: Failed to send welcome credentials email:', emailErr);
      }
    }

    const populatedBusiness = await Business.findById(business._id)
      .populate('planId', 'name slug price variants');

    res.status(201).json({
      message: `Shop "${finalBusinessName}" registered and onboarded successfully!`,
      business: populatedBusiness,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessId: user.businessId
      },
      credentials: {
        email: finalEmail,
        password: rawPassword
      }
    });
  } catch (error: any) {
    console.error('Error in registerBusinessByAdmin:', error);
    res.status(500).json({ message: error?.message || 'Server error during business registration' });
  }
};

// ==========================================
// AGENT MANAGEMENT (SUPERADMIN CONTROLS)
// ==========================================

export const getAgents = async (req: Request, res: Response): Promise<any> => {
  try {
    const agents = await User.find({ role: UserRole.AGENT })
      .select('-password')
      .populate('assignedBusinessIds', 'name slug verificationStatus category phone email')
      .sort({ createdAt: -1 });

    res.json(agents);
  } catch (error: any) {
    console.error('Error in getAgents:', error);
    res.status(500).json({ message: 'Server error while fetching agents' });
  }
};

export const getAgentById = async (req: Request, res: Response): Promise<any> => {
  try {
    const agent = await User.findOne({ _id: req.params.id, role: UserRole.AGENT })
      .select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const registeredShops = await Business.find({
      $or: [
        { registeredByAgentId: agent._id },
        { assignedAgentId: agent._id },
        { _id: { $in: agent.assignedBusinessIds || [] } }
      ],
      isDemoAccount: { $ne: true }
    })
      .populate('planId', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      ...agent.toObject(),
      registeredShops
    });
  } catch (error: any) {
    console.error('Error in getAgentById:', error);
    res.status(500).json({ message: 'Server error while fetching agent' });
  }
};

export const createAgent = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, password, confirmPassword, permissions, assignedBusinessIds } = req.body;

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    if (phone && phone.trim()) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({ message: 'A user with this phone number already exists' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const safePermissions = {
      canManageShopProfile: permissions?.canManageShopProfile !== false,
      canManageOnboarding: permissions?.canManageOnboarding !== false,
      canManageAppointments: permissions?.canManageAppointments !== false,
      canManageBilling: permissions?.canManageBilling !== false,
      canAccessRegistration: permissions?.canAccessRegistration !== false,
      canAccessOnboardedShops: permissions?.canAccessOnboardedShops !== false,
      canAccessExpiredShops: Boolean(permissions?.canAccessExpiredShops),
      canAccessBusinessAdmins: Boolean(permissions?.canAccessBusinessAdmins),
      canAccessPlans: Boolean(permissions?.canAccessPlans),
      canAccessCoupons: Boolean(permissions?.canAccessCoupons),
      canAccessDemoRequests: Boolean(permissions?.canAccessDemoRequests),
      canAccessPayments: Boolean(permissions?.canAccessPayments),
      canRegisterShops: permissions?.canRegisterShops !== false,
    };

    const businessIds = Array.isArray(assignedBusinessIds) ? assignedBusinessIds : [];

    const agent = new User({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      role: UserRole.AGENT,
      permissions: safePermissions,
      assignedBusinessIds: businessIds,
      isActive: true,
    });

    await agent.save();

    // Sync assignedBusinessIds to Business documents
    if (businessIds.length > 0) {
      await Business.updateMany(
        { _id: { $in: businessIds } },
        { $set: { assignedAgentId: agent._id } }
      );
    }

    const populatedAgent = await User.findById(agent._id)
      .select('-password');

    res.status(201).json({
      ...populatedAgent?.toObject(),
      registeredShops: []
    });
  } catch (error: any) {
    console.error('Error in createAgent:', error);
    res.status(500).json({ message: error?.message || 'Server error while creating agent' });
  }
};

export const updateAgent = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, confirmPassword, permissions, assignedBusinessIds, isActive } = req.body;

    if (password && confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const agent = await User.findOne({ _id: id, role: UserRole.AGENT });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (name) agent.name = name.trim();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== agent.email) {
        const emailTaken = await User.findOne({ email: cleanEmail });
        if (emailTaken) {
          return res.status(400).json({ message: 'Email is already taken by another user' });
        }
        agent.email = cleanEmail;
      }
    }

    if (phone !== undefined) {
      const cleanPhone = phone ? phone.trim() : undefined;
      if (cleanPhone && cleanPhone !== agent.phone) {
        const phoneTaken = await User.findOne({ phone: cleanPhone });
        if (phoneTaken) {
          return res.status(400).json({ message: 'Phone number is already taken' });
        }
      }
      agent.phone = cleanPhone;
    }

    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      agent.password = await bcrypt.hash(password.trim(), salt);
    }

    if (permissions) {
      agent.permissions = {
        canManageShopProfile: permissions.canManageShopProfile !== undefined ? permissions.canManageShopProfile : agent.permissions?.canManageShopProfile ?? true,
        canManageOnboarding: permissions.canManageOnboarding !== undefined ? permissions.canManageOnboarding : agent.permissions?.canManageOnboarding ?? true,
        canManageAppointments: permissions.canManageAppointments !== undefined ? permissions.canManageAppointments : agent.permissions?.canManageAppointments ?? true,
        canManageBilling: permissions.canManageBilling !== undefined ? permissions.canManageBilling : agent.permissions?.canManageBilling ?? true,
        canAccessRegistration: permissions.canAccessRegistration !== undefined ? permissions.canAccessRegistration : agent.permissions?.canAccessRegistration ?? true,
        canAccessOnboardedShops: permissions.canAccessOnboardedShops !== undefined ? permissions.canAccessOnboardedShops : agent.permissions?.canAccessOnboardedShops ?? true,
        canAccessExpiredShops: permissions.canAccessExpiredShops !== undefined ? permissions.canAccessExpiredShops : agent.permissions?.canAccessExpiredShops ?? false,
        canAccessBusinessAdmins: permissions.canAccessBusinessAdmins !== undefined ? permissions.canAccessBusinessAdmins : agent.permissions?.canAccessBusinessAdmins ?? false,
        canAccessPlans: permissions.canAccessPlans !== undefined ? permissions.canAccessPlans : agent.permissions?.canAccessPlans ?? false,
        canAccessCoupons: permissions.canAccessCoupons !== undefined ? permissions.canAccessCoupons : agent.permissions?.canAccessCoupons ?? false,
        canAccessDemoRequests: permissions.canAccessDemoRequests !== undefined ? permissions.canAccessDemoRequests : agent.permissions?.canAccessDemoRequests ?? false,
        canAccessPayments: permissions.canAccessPayments !== undefined ? permissions.canAccessPayments : agent.permissions?.canAccessPayments ?? false,
        canRegisterShops: permissions.canRegisterShops !== undefined ? permissions.canRegisterShops : agent.permissions?.canRegisterShops ?? true,
      };
    }

    if (isActive !== undefined) {
      agent.isActive = Boolean(isActive);
    }

    if (Array.isArray(assignedBusinessIds)) {
      const oldAssigned = (agent.assignedBusinessIds || []).map((bId) => bId.toString());
      const newAssigned = assignedBusinessIds.map((bId: any) => bId.toString());

      // Businesses removed: unset assignedAgentId
      const removed = oldAssigned.filter((bId) => !newAssigned.includes(bId));
      if (removed.length > 0) {
        await Business.updateMany(
          { _id: { $in: removed }, assignedAgentId: agent._id },
          { $set: { assignedAgentId: null } }
        );
      }

      // Businesses added: set assignedAgentId
      const added = newAssigned.filter((bId) => !oldAssigned.includes(bId));
      if (added.length > 0) {
        await Business.updateMany(
          { _id: { $in: added } },
          { $set: { assignedAgentId: agent._id } }
        );
      }

      agent.assignedBusinessIds = assignedBusinessIds;
    }

    await agent.save();

    const populated = await User.findById(agent._id)
      .select('-password');

    const registeredShops = await Business.find({
      $or: [
        { registeredByAgentId: agent._id },
        { assignedAgentId: agent._id },
        { _id: { $in: agent.assignedBusinessIds || [] } }
      ],
      isDemoAccount: { $ne: true }
    })
      .populate('planId', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      ...populated?.toObject(),
      registeredShops
    });
  } catch (error: any) {
    console.error('Error in updateAgent:', error);
    res.status(500).json({ message: error?.message || 'Server error while updating agent' });
  }
};

export const deleteAgent = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const agent = await User.findOne({ _id: id, role: UserRole.AGENT });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Unassign all businesses
    await Business.updateMany(
      { assignedAgentId: agent._id },
      { $set: { assignedAgentId: null } }
    );

    await User.findByIdAndDelete(agent._id);
    res.json({ message: 'Agent removed successfully' });
  } catch (error: any) {
    console.error('Error in deleteAgent:', error);
    res.status(500).json({ message: error?.message || 'Server error while deleting agent' });
  }
};

export const getSuperadminAppointments = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status, type, search } = req.query;
    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (type && type !== 'all') {
      query.type = type;
    }
    if (search) {
      const term = String(search).trim();
      query.$or = [
        { customerName: { $regex: term, $options: 'i' } },
        { customerPhone: { $regex: term, $options: 'i' } },
        { customerEmail: { $regex: term, $options: 'i' } },
        { title: { $regex: term, $options: 'i' } }
      ];
    }
    const appointments = await Appointment.find(query)
      .populate('businessId', 'name slug ownerName phone email category')
      .populate('serviceId', 'name price duration')
      .sort({ startTime: -1, createdAt: -1 })
      .limit(300);

    const total = await Appointment.countDocuments();
    const confirmedCount = await Appointment.countDocuments({ status: AppointmentStatus.CONFIRMED });
    const pendingCount = await Appointment.countDocuments({ status: AppointmentStatus.PENDING });
    const completedCount = await Appointment.countDocuments({ status: AppointmentStatus.COMPLETED });
    const cancelledCount = await Appointment.countDocuments({ status: AppointmentStatus.CANCELLED });

    res.json({
      appointments,
      total,
      stats: {
        confirmed: confirmedCount,
        pending: pendingCount,
        completed: completedCount,
        cancelled: cancelledCount
      }
    });
  } catch (error: any) {
    console.error('Error fetching appointments for superadmin:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

export const getSuperadminNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    await backfillNotificationsIfEmpty();

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 15));
    const type = req.query.type as string;
    const search = req.query.search as string;

    const query: any = { recipientRole: 'Superadmin' };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { message: { $regex: term, $options: 'i' } },
        { 'data.shopName': { $regex: term, $options: 'i' } },
        { 'data.agentName': { $regex: term, $options: 'i' } }
      ];
    }

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipientRole: 'Superadmin', read: false });

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.json({
      notifications,
      total,
      page,
      limit,
      totalPages,
      unreadCount,
      hasMore
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    const unreadCount = await Notification.countDocuments({ recipientRole: 'Superadmin', read: false });
    res.json({ message: 'Marked as read', notification, unreadCount });
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    await Notification.updateMany({ recipientRole: 'Superadmin', read: false }, { read: true });
    res.json({ message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const clearAllNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    await Notification.deleteMany({ recipientRole: 'Superadmin' });
    res.json({ message: 'All notifications cleared', unreadCount: 0 });
  } catch (error: any) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
