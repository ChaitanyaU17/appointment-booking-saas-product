import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middlewares/authMiddleware';
import Business from '../models/Business';
import Appointment, { AppointmentStatus } from '../models/Appointment';
import Service from '../models/Service';
import User, { UserRole, IAgentPermissions } from '../models/User';
import Coupon from '../models/Coupon';
import DemoRequest from '../models/DemoRequest';
import Payment from '../models/Payment';
import { sendWelcomeCredentialsEmail } from '../utils/emailService';
import { createNotification } from '../utils/notificationService';
import {
  createDemoForRegistration,
  markDemoConducted,
  approveBusiness,
  rejectBusiness,
  requestBusinessChanges,
  activateTrial,
  generatePaymentLink,
  cleanupDemoSandbox
} from './superadminController';
import { getPlans } from './planController';

// Helper to filter shops registered by or assigned to this agent
export const getAgentShopFilter = (user: any) => ({
  $or: [
    { registeredByAgentId: user._id },
    { assignedAgentId: user._id },
    { _id: { $in: user.assignedBusinessIds || [] } }
  ],
  isDemoAccount: { $ne: true }
});

// Get current Agent profile and permissions
export const getAgentProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('assignedBusinessIds', 'name slug verificationStatus subscriptionStatus category phone email');

    if (!user) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Error in getAgentProfile:', error);
    res.status(500).json({ message: 'Server error fetching agent profile' });
  }
};

// Get Dashboard KPIs for shops registered by / assigned to this agent
export const getAgentDashboardStats = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const shopFilter = getAgentShopFilter(req.user);
    const agentShops = await Business.find(shopFilter).select('_id verificationStatus subscriptionStatus name slug category phone email createdAt');
    const shopIds = agentShops.map((s) => s._id);

    if (shopIds.length === 0) {
      return res.json({
        totalAssignedShops: 0,
        activeShops: 0,
        pendingShops: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        recentAppointments: [],
        shops: [],
        permissions: req.user.permissions,
      });
    }

    const totalAssignedShops = shopIds.length;
    const activeShops = agentShops.filter((s) => s.verificationStatus === 'Approved').length;
    const pendingShops = agentShops.filter((s) => s.verificationStatus !== 'Approved').length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [totalAppointments, todayAppointments, recentAppointments] = await Promise.all([
      Appointment.countDocuments({ businessId: { $in: shopIds } }),
      Appointment.countDocuments({
        businessId: { $in: shopIds },
        startTime: { $gte: startOfToday, $lte: endOfToday },
      }),
      Appointment.find({ businessId: { $in: shopIds } })
        .populate('businessId', 'name slug')
        .sort({ startTime: -1 })
        .limit(6),
    ]);

    const recentShops = await Business.find({ _id: { $in: shopIds } })
      .select('name slug verificationStatus subscriptionStatus category phone email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalAssignedShops,
      activeShops,
      pendingShops,
      totalAppointments,
      todayAppointments,
      recentAppointments,
      shops: recentShops,
      permissions: req.user.permissions,
    });
  } catch (error: any) {
    console.error('Error in getAgentDashboardStats:', error);
    res.status(500).json({ message: 'Server error fetching agent stats' });
  }
};

// Get all shops registered by / assigned to this agent with service & appointment counts
export const getAssignedShops = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const shopFilter = getAgentShopFilter(req.user);
    const { search, status } = req.query;

    const query: any = { ...shopFilter };

    if (search) {
      const term = String(search).trim();
      query.$and = [
        shopFilter,
        {
          $or: [
            { name: { $regex: term, $options: 'i' } },
            { email: { $regex: term, $options: 'i' } },
            { phone: { $regex: term, $options: 'i' } },
            { category: { $regex: term, $options: 'i' } },
            { slug: { $regex: term, $options: 'i' } },
          ],
        },
      ];
      delete query.$or;
    }

    if (status && status !== 'all') {
      query.verificationStatus = status;
    }

    const shops = await Business.find(query)
      .populate('planId', 'name slug price variants')
      .populate('requestedPlanId', 'name slug price variants')
      .sort({ createdAt: -1 });

    const shopIds = shops.map((s) => s._id);
    const admins = await User.find(
      {
        role: UserRole.BUSINESS_ADMIN,
        $or: [
          { businessId: { $in: shopIds } },
          { originalBusinessId: { $in: shopIds } }
        ]
      },
      'name email phone businessId originalBusinessId'
    ).lean();

    const enrichedShops = await Promise.all(
      shops.map(async (shop) => {
        const admin = admins.find(
          (a) =>
            a.businessId?.toString() === shop._id.toString() ||
            a.originalBusinessId?.toString() === shop._id.toString()
        );
        const [servicesCount, appointmentsCount] = await Promise.all([
          Service.countDocuments({ businessId: shop._id }),
          Appointment.countDocuments({ businessId: shop._id }),
        ]);

        const shopObj: any = shop.toObject();
        const ownerName = shopObj.ownerName || admin?.name || '';
        return {
          ...shopObj,
          ownerName,
          ownerEmail: admin?.email || shopObj.email || '',
          ownerPhone: admin?.phone || shopObj.phone || '',
          servicesCount,
          appointmentsCount,
        };
      })
    );

    res.json(enrichedShops);
  } catch (error: any) {
    console.error('Error in getAssignedShops:', error);
    res.status(500).json({ message: 'Server error fetching assigned shops' });
  }
};

// Register a new shop by Agent (automatically tags shop as registered by this agent)
export const registerShopByAgent = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.permissions?.canRegisterShops === false) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to register shops' });
    }

    const {
      name,
      ownerName,
      email,
      phone,
      password,
      confirmPassword,
      businessName,
      category,
      additionalNotes,
      sendWelcomeEmail
    } = req.body;

    const finalOwnerName = (name || ownerName || '').trim();
    const finalEmail = (email || '').toLowerCase().trim();
    const finalPhone = (phone || '').trim();
    const finalBusinessName = (businessName || finalOwnerName || 'New Shop').trim();

    if (!finalOwnerName || !finalEmail) {
      return res.status(400).json({ message: 'Owner name and email are required' });
    }

    if (password && confirmPassword && password.trim() !== confirmPassword.trim()) {
      return res.status(400).json({ message: 'Passwords do not match' });
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

    const rawPassword = (password || '').trim() || 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const business = new Business({
      name: finalBusinessName,
      slug: finalSlug,
      category: category || 'General',
      registrationNumber: 'N/A',
      additionalNotes: additionalNotes || '',
      description: additionalNotes || '',
      email: finalEmail,
      phone: finalPhone || 'N/A',
      ownerName: finalOwnerName,
      verificationStatus: 'Pending',
      subscriptionStatus: 'trial',
      trialStatus: 'None',
      demoStatus: 'None',
      paymentStatus: 'Pending',
      planStartDate: new Date(),
      registeredByAgentId: req.user._id,
      assignedAgentId: req.user._id,
    });

    await business.save();

    let ownerUser: any;
    try {
      ownerUser = new User({
        name: finalOwnerName,
        email: finalEmail,
        phone: finalPhone || undefined,
        password: hashedPassword,
        role: UserRole.BUSINESS_ADMIN,
        businessId: business._id
      });
      await ownerUser.save();
    } catch (userErr: any) {
      await Business.findByIdAndDelete(business._id);
      throw userErr;
    }

    // Add to agent's assignedBusinessIds
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { assignedBusinessIds: business._id }
    });

    const registeredUserName = business.ownerName || business.name || 'New User';
    await createNotification({
      title: 'Agent Registered User',
      message: `Agent ${req.user.name || 'Agent'} registered user "${registeredUserName}".`,
      type: 'registration',
      recipientRole: 'Superadmin',
      data: {
        shopId: business._id,
        shopName: registeredUserName,
        agentId: req.user._id,
        agentName: req.user.name,
        actionUrl: `/superadmin/registration?biz=${business._id}`,
        stage: 'Demo Provisioning'
      }
    });

    if (sendWelcomeEmail !== false) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        await sendWelcomeCredentialsEmail({
          to: finalEmail,
          ownerName: finalOwnerName,
          businessName: finalBusinessName || `${finalOwnerName}'s Shop`,
          loginUrl: `${frontendUrl}/login`,
          email: finalEmail,
          password: rawPassword,
          isDirectActive: false,
        });
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
      }
    }

    res.status(201).json({
      message: `Shop owner "${finalOwnerName}" registered successfully! It is now pending verification in your Registration queue.`,
      business,
      user: {
        _id: ownerUser._id,
        name: ownerUser.name,
        email: ownerUser.email,
        phone: ownerUser.phone,
        role: ownerUser.role
      }
    });
  } catch (error: any) {
    console.error('Error in registerShopByAgent:', error);
    res.status(500).json({ message: error.message || 'Server error while registering shop' });
  }
};

// Get single shop details (must be registered by or assigned to this agent)
export const getShopDetails = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const isSuperadmin = req.user.role === 'Superadmin';
    const query: any = isSuperadmin
      ? { _id: id }
      : {
          _id: id,
          $or: [
            { registeredByAgentId: req.user._id },
            { assignedAgentId: req.user._id },
            { _id: { $in: req.user.assignedBusinessIds || [] } }
          ]
        };

    const shop = await Business.findOne(query)
      .populate('planId', 'name slug price variants durationDays features')
      .populate('requestedPlanId', 'name slug price variants durationDays features');

    if (!shop) {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this shop' });
    }

    const [services, recentAppointments, appointmentsCount, walkinsCount] = await Promise.all([
      Service.find({ businessId: shop._id }),
      Appointment.find({ businessId: shop._id }).sort({ startTime: -1 }).limit(10),
      Appointment.countDocuments({ businessId: shop._id as any }),
      Appointment.countDocuments({ businessId: shop._id as any, type: 'Walk-in' as any }),
    ]);

    const admin = await User.findOne(
      {
        role: UserRole.BUSINESS_ADMIN,
        $or: [
          { businessId: shop._id },
          { originalBusinessId: shop._id }
        ]
      },
      'name email phone businessId originalBusinessId'
    ).lean();

    const shopObj: any = shop.toObject();
    shopObj.ownerName = shopObj.ownerName || admin?.name || '';
    shopObj.ownerEmail = admin?.email || shopObj.email || '';
    shopObj.ownerPhone = admin?.phone || shopObj.phone || '';
    shopObj.stats = {
      appointments: appointmentsCount,
      walkins: walkinsCount,
      services: services.length,
    };

    res.json({
      shop: shopObj,
      services,
      recentAppointments,
      permissions: req.user.permissions,
    });
  } catch (error: any) {
    console.error('Error in getShopDetails:', error);
    res.status(500).json({ message: 'Server error fetching shop details' });
  }
};

// Update shop profile
export const updateShopProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.permissions?.canManageShopProfile === false) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage shop profiles' });
    }

    const { id } = req.params;
    const shop = await Business.findOne({
      _id: id,
      $or: [
        { registeredByAgentId: req.user._id },
        { assignedAgentId: req.user._id },
        { _id: { $in: req.user.assignedBusinessIds || [] } }
      ]
    });

    if (!shop) {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this shop' });
    }

    const { name, phone, email, category, description, settings } = req.body;

    if (name) {
      const trimmedName = name.trim();
      const oldName = shop.name;
      shop.name = trimmedName;

      // Update slug if slug was auto-generated shop-xxxx or name changed
      if (!shop.slug || shop.slug.startsWith('shop-') || trimmedName !== oldName) {
        let baseSlug = trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        if (!baseSlug) {
          baseSlug = `shop-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        let finalSlug = baseSlug;
        const slugExists = await Business.findOne({
          slug: finalSlug,
          _id: { $ne: shop._id },
        });
        if (slugExists) {
          finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        shop.slug = finalSlug;
      }
    }
    if (phone) shop.phone = phone.trim();
    if (email) shop.email = email.trim().toLowerCase();
    if (category) shop.category = category.trim();
    if (description !== undefined) shop.description = description;
    if (settings) {
      shop.settings = {
        ...shop.settings,
        ...settings,
      };
    }

    await shop.save();
    res.json({ message: 'Shop profile updated successfully', shop });
  } catch (error: any) {
    console.error('Error in updateShopProfile:', error);
    res.status(500).json({ message: error.message || 'Server error updating shop profile' });
  }
};

// Update shop onboarding/verification
export const updateShopOnboarding = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.permissions?.canManageOnboarding === false) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage onboarding' });
    }

    const { id } = req.params;
    const shop = await Business.findOne({
      _id: id,
      $or: [
        { registeredByAgentId: req.user._id },
        { assignedAgentId: req.user._id },
        { _id: { $in: req.user.assignedBusinessIds || [] } }
      ]
    });

    if (!shop) {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this shop' });
    }

    const { verificationStatus, demoStatus, notes } = req.body;

    if (verificationStatus) shop.verificationStatus = verificationStatus;
    if (demoStatus) shop.demoStatus = demoStatus;
    if (notes) shop.additionalNotes = notes;

    await shop.save();
    res.json({ message: 'Shop onboarding updated successfully', shop });
  } catch (error: any) {
    console.error('Error in updateShopOnboarding:', error);
    res.status(500).json({ message: error.message || 'Server error updating onboarding' });
  }
};

// Get appointments for agent's shops
export const getAgentAppointments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.permissions?.canManageAppointments === false) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage appointments' });
    }

    const agentShops = await Business.find(getAgentShopFilter(req.user)).select('_id');
    const shopIds = agentShops.map((s) => s._id);

    const { businessId, status, date } = req.query;

    const query: any = { businessId: { $in: shopIds } };

    if (businessId && shopIds.map((id: any) => id.toString()).includes(businessId.toString())) {
      query.businessId = businessId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const searchDate = new Date(date as string);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('businessId', 'name slug phone email')
      .populate('serviceId', 'name duration price')
      .sort({ startTime: -1 })
      .limit(100);

    res.json(appointments);
  } catch (error: any) {
    console.error('Error in getAgentAppointments:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// Update appointment status
export const updateAgentAppointmentStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.permissions?.canManageAppointments === false) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage appointments' });
    }

    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const hasAccess = await Business.exists({
      _id: appointment.businessId,
      $or: [
        { registeredByAgentId: req.user._id },
        { assignedAgentId: req.user._id },
        { _id: { $in: req.user.assignedBusinessIds || [] } }
      ]
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden: Appointment belongs to an unmanaged shop' });
    }

    if (Object.values(AppointmentStatus).includes(status)) {
      appointment.status = status;
      await appointment.save();
      return res.json({ message: 'Appointment status updated successfully', appointment });
    }

    return res.status(400).json({ message: 'Invalid appointment status' });
  } catch (error: any) {
    console.error('Error in updateAgentAppointmentStatus:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
};

// Scoped Registration section for Agent (pending/changes requested shops registered by agent)
export const getAgentRegistrationShops = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessRegistration === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Registration' });
    }

    const shops = await Business.find({
      $and: [
        getAgentShopFilter(req.user),
        { verificationStatus: { $in: ['Pending', 'ChangesRequested'] } }
      ]
    })
      .populate('planId', 'name slug price')
      .populate('requestedPlanId', 'name')
      .sort({ createdAt: -1 });
    const shopIds = shops.map((s) => s._id);
    const admins = await User.find(
      {
        role: UserRole.BUSINESS_ADMIN,
        $or: [
          { businessId: { $in: shopIds } },
          { originalBusinessId: { $in: shopIds } }
        ]
      },
      'name email phone businessId originalBusinessId'
    ).lean();

    const enriched = shops.map((shop) => {
      const admin = admins.find(
        (a) =>
          a.businessId?.toString() === shop._id.toString() ||
          a.originalBusinessId?.toString() === shop._id.toString()
      );
      const shopObj: any = shop.toObject();
      return {
        ...shopObj,
        ownerName: shopObj.ownerName || admin?.name || '',
        ownerEmail: admin?.email || shopObj.email || '',
        ownerPhone: admin?.phone || shopObj.phone || '',
      };
    });

    res.json(enriched);
  } catch (error: any) {
    console.error('Error in getAgentRegistrationShops:', error);
    res.status(500).json({ message: 'Server error fetching registration shops' });
  }
};

// Scoped Expired shops for Agent
export const getAgentExpiredShops = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessExpiredShops === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Expired Shops' });
    }

    const shops = await Business.find({
      $and: [
        getAgentShopFilter(req.user),
        { verificationStatus: 'Approved' }
      ]
    })
      .populate('planId', 'name slug price')
      .sort({ createdAt: -1 });

    res.json(shops);
  } catch (error: any) {
    console.error('Error in getAgentExpiredShops:', error);
    res.status(500).json({ message: 'Server error fetching expired shops' });
  }
};

// Scoped Business Admins for Agent
export const getAgentBusinessAdmins = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessBusinessAdmins === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Business Admins' });
    }

    const agentShops = await Business.find(getAgentShopFilter(req.user)).select('_id');
    const shopIds = agentShops.map((s) => s._id);

    const admins = await User.find({
      role: UserRole.BUSINESS_ADMIN,
      $or: [
        { businessId: { $in: shopIds } },
        { originalBusinessId: { $in: shopIds } }
      ]
    })
      .populate('businessId', 'name slug ownerName category')
      .populate('originalBusinessId', 'name slug ownerName category')
      .select('-password');

    res.json(admins);
  } catch (error: any) {
    console.error('Error in getAgentBusinessAdmins:', error);
    res.status(500).json({ message: 'Server error fetching business admins' });
  }
};

// Create business admin by Agent
export const agentCreateBusinessAdmin = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessBusinessAdmins === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Business Admins' });
    }

    const { name, email, password, businessId } = req.body;

    const hasAccess = await Business.exists({
      _id: businessId,
      ...getAgentShopFilter(req.user)
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden: You cannot assign an admin to a shop you do not manage' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: UserRole.BUSINESS_ADMIN,
      businessId
    });

    const createdUser = await user.save();

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

    const populated = await User.findById(createdUser._id)
      .populate('businessId', 'name slug ownerName category')
      .select('-password');

    res.status(201).json(populated || createdUser);
  } catch (error: any) {
    console.error('Error in agentCreateBusinessAdmin:', error);
    res.status(500).json({ message: error.message || 'Server error creating business admin' });
  }
};

// Update business admin by Agent
export const agentUpdateBusinessAdmin = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessBusinessAdmins === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Business Admins' });
    }

    const { id } = req.params;
    const { name, email, password, businessId } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetBusinessId = user.businessId || (user as any).originalBusinessId || businessId;
    if (targetBusinessId) {
      const hasAccess = await Business.exists({
        _id: targetBusinessId,
        ...getAgentShopFilter(req.user)
      });
      if (!hasAccess) {
        return res.status(403).json({ message: 'Forbidden: You cannot modify an admin for a shop you do not manage' });
      }
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

    // Synchronize linked Business document
    let business = targetBusinessId ? await Business.findById(targetBusinessId) : null;
    if (!business) {
      const shopFilter = getAgentShopFilter(req.user);
      business = await Business.findOne({
        $and: [
          {
            $or: [
              { email: oldEmail },
              { email: user.email }
            ]
          },
          shopFilter
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
      .populate('businessId', 'name slug ownerName category')
      .select('-password');

    res.json(populatedUser || updatedUser);
  } catch (error: any) {
    console.error('Error in agentUpdateBusinessAdmin:', error);
    res.status(500).json({ message: error.message || 'Server error updating business admin' });
  }
};

// Delete business admin by Agent
export const agentDeleteBusinessAdmin = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessBusinessAdmins === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Business Admins' });
    }

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetBusinessId = user.businessId || (user as any).originalBusinessId;
    if (targetBusinessId) {
      const hasAccess = await Business.exists({
        _id: targetBusinessId,
        ...getAgentShopFilter(req.user)
      });
      if (!hasAccess) {
        return res.status(403).json({ message: 'Forbidden: You cannot delete an admin for a shop you do not manage' });
      }
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error: any) {
    console.error('Error in agentDeleteBusinessAdmin:', error);
    res.status(500).json({ message: error.message || 'Server error deleting business admin' });
  }
};

// Scoped Coupons for Agent
export const getAgentCoupons = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessCoupons === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Coupons' });
    }

    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    console.error('Error in getAgentCoupons:', error);
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
};

// Scoped Demo Requests for Agent
export const getAgentDemoRequests = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessDemoRequests === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Demo Requests' });
    }

    const requests = await DemoRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error: any) {
    console.error('Error in getAgentDemoRequests:', error);
    res.status(500).json({ message: 'Server error fetching demo requests' });
  }
};

// Scoped Payments for Agent's registered shops
export const getAgentPayments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.permissions?.canAccessPayments === false) {
      return res.status(403).json({ message: 'Forbidden: No permission for Payments' });
    }

    const agentShops = await Business.find(getAgentShopFilter(req.user)).select('_id');
    const shopIds = agentShops.map((s) => s._id);

    const payments = await Payment.find({ businessId: { $in: shopIds } })
      .populate('businessId', 'name slug email phone')
      .populate('planId', 'name')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error: any) {
    console.error('Error in getAgentPayments:', error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};

// ==========================================
// AGENT ONBOARDING PIPELINE WORKSPACE HANDLERS
// ==========================================

const ensureAgentShopAccess = async (
  req: AuthRequest,
  res: Response,
  shopId: any,
  permissionKey?: keyof IAgentPermissions
): Promise<boolean> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return false;
  }
  const hasAccess = await Business.exists({
    _id: shopId,
    $or: [
      { registeredByAgentId: req.user._id },
      { assignedAgentId: req.user._id },
      { _id: { $in: req.user.assignedBusinessIds || [] } }
    ]
  });
  if (!hasAccess) {
    res.status(403).json({ message: 'Forbidden: You do not have access to this shop' });
    return false;
  }
  if (permissionKey && req.user.permissions?.[permissionKey] === false) {
    res.status(403).json({ message: `Forbidden: You do not have permission for ${permissionKey}` });
    return false;
  }
  return true;
};

// Get active plans for onboarding/plan allocation
export const getAgentPlans = async (req: AuthRequest, res: Response) => {
  if (req.user?.permissions?.canAccessPlans === false) {
    return res.status(403).json({ message: 'Forbidden: No permission for Plans' });
  }
  return getPlans(req, res);
};

// Provision Google Meet sandbox demo account for shop
export const agentCreateDemo = async (req: AuthRequest, res: Response) => {
  if (!(await ensureAgentShopAccess(req, res, req.params.id, 'canManageOnboarding'))) return;
  return createDemoForRegistration(req, res);
};

// Mark onboarding demo as conducted
export const agentMarkDemoConducted = async (req: AuthRequest, res: Response) => {
  if (!(await ensureAgentShopAccess(req, res, req.params.id, 'canManageOnboarding'))) return;
  return markDemoConducted(req, res);
};

// Approve shop onboarding
export const agentApproveBusiness = async (req: AuthRequest, res: Response) => {
  if (!(await ensureAgentShopAccess(req, res, req.params.id, 'canManageOnboarding'))) return;
  return approveBusiness(req, res);
};

// Reject shop onboarding with reason
export const agentRejectBusiness = async (req: AuthRequest, res: Response) => {
  if (!(await ensureAgentShopAccess(req, res, req.params.id, 'canManageOnboarding'))) return;
  return rejectBusiness(req, res);
};

// Request changes from business applicant
export const agentRequestBusinessChanges = async (req: AuthRequest, res: Response) => {
  if (!(await ensureAgentShopAccess(req, res, req.params.id, 'canManageOnboarding'))) return;
  return requestBusinessChanges(req, res);
};

// Activate free trial for assigned shop
export const agentActivateTrial = async (req: AuthRequest, res: Response) => {
  if (!(await ensureAgentShopAccess(req, res, req.params.id, 'canManageOnboarding'))) return;
  return activateTrial(req, res);
};

// Generate payment link with breakdown
export const agentGeneratePaymentLink = async (req: AuthRequest, res: Response) => {
  if (!(await ensureAgentShopAccess(req, res, req.params.id))) return;
  const canOnboard = req.user?.permissions?.canManageOnboarding !== false;
  const canBill = Boolean(req.user?.permissions?.canManageBilling);
  if (!canOnboard && !canBill) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to generate payment links' });
  }
  return generatePaymentLink(req, res);
};

// Delete shop and clear registration data (Ask to Re-Register)
export const agentDeleteShop = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const business = await Business.findOne({
      _id: id,
      $or: [
        { registeredByAgentId: req.user._id },
        { assignedAgentId: req.user._id },
        { _id: { $in: req.user.assignedBusinessIds || [] } }
      ]
    });

    if (!business) {
      return res.status(404).json({ message: 'Shop not found or you do not have permission to delete it' });
    }

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

    res.json({ message: 'Business data cleared. They can now re-register.' });
  } catch (error: any) {
    console.error('Error deleting shop by agent:', error);
    res.status(500).json({ message: error.message || 'Server error while deleting shop' });
  }
};
