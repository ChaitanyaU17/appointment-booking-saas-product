import mongoose from 'mongoose';
import DemoRequest from '../models/DemoRequest';
import Appointment, { AppointmentStatus, AppointmentType } from '../models/Appointment';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import Business from '../models/Business';
import Plan from '../models/Plan';
import Service from '../models/Service';

const cleanupDemoSandbox = async (business: any) => {
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
    const totalBusinesses = await Business.countDocuments();
    const registeredShops = await Business.countDocuments({ verificationStatus: 'Approved' });
    const pendingShops = await Business.countDocuments({ verificationStatus: { $in: ['Pending', 'ChangesRequested'] } });
    const totalAdmins = await User.countDocuments({ role: UserRole.BUSINESS_ADMIN });
    const totalAppointments = await Appointment.countDocuments();
    const activeTrials = await Business.countDocuments({ trialStatus: 'Active' });
    const pendingDemoRequests = await DemoRequest.countDocuments({ status: 'Pending' });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const appointmentsToday = await Appointment.countDocuments({
      startTime: { $gte: startOfToday, $lte: endOfToday }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
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

    const formattedTrend = trendData.map(d => ({ date: d._id, count: d.count }));

    const typeData = await Appointment.aggregate([
      {
        $group: {
          _id: "$type",
          value: { $sum: 1 }
        }
      }
    ]);

    const recentBusinesses = await Business.find().sort({ createdAt: -1 }).limit(5);
    const recentAdmins = await User.find({ role: UserRole.BUSINESS_ADMIN }).sort({ createdAt: -1 }).limit(5);

    const recentActivity = [
      ...recentBusinesses.map(b => ({
        id: b._id,
        type: 'business',
        message: `New business '${b.name}' created`,
        date: (b as any).createdAt || new Date()
      })),
      ...recentAdmins.map(a => ({
        id: a._id,
        type: 'admin',
        message: `New admin '${a.name}' registered`,
        date: (a as any).createdAt || new Date()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    res.json({
      totalBusinesses,
      registeredShops,
      pendingShops,
      pendingDemoRequests,
      totalAdmins,
      totalAppointments,
      activeTrials,
      appointmentsToday,
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
    const businesses = await Business.find({})
      .populate('planId', 'name slug price')
      .populate('requestedPlanId', 'name')
      .lean();
    
    // Fetch all business admins to map owner names
    const admins = await User.find({ role: UserRole.BUSINESS_ADMIN }, 'name email phone businessId originalBusinessId').lean();
    
    const businessesWithOwner = businesses.map(b => {
      const admin = admins.find(a => a.businessId?.toString() === b._id.toString() || a.originalBusinessId?.toString() === b._id.toString());
      return {
        ...b,
        ownerName: admin?.name || null,
        ownerEmail: admin?.email || null,
        ownerPhone: admin?.phone || null,
      };
    });

    res.json(businessesWithOwner);
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
      business.name = name || business.name;
      business.slug = slug || business.slug;
      business.description = description || business.description;
      if (email !== undefined) business.email = email;
      if (phone !== undefined) business.phone = phone;
      if (category) business.category = category;
      if (registrationNumber) business.registrationNumber = registrationNumber;
      if (settings) business.settings = settings;
      if (planId !== undefined) {
        business.planId = planId;
        // If manually assigning a plan, clear any active trial
        if (business.trialStatus === "Active") {
          business.trialStatus = "Converted";
          business.trialEndsAt = undefined;
          business.trialStartedAt = undefined;
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
      await User.deleteMany({ businessId: business._id });
      await Appointment.deleteMany({ businessId: business._id });
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
      .populate('businessId', 'name')
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
    res.status(201).json(createdUser);
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

    if (name) user.name = name;
    if (email) user.email = email;
    if (businessId) user.businessId = businessId;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
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
