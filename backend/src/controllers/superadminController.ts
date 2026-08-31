import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { UserRole } from '../models/User';
import Business from '../models/Business';
import Appointment from '../models/Appointment';
import Plan from '../models/Plan';

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalBusinesses = await Business.countDocuments();
    const totalAdmins = await User.countDocuments({ role: UserRole.BUSINESS_ADMIN });
    const totalAppointments = await Appointment.countDocuments();

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
      totalAdmins,
      totalAppointments,
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
    const businesses = await Business.find({}).populate('planId', 'name slug price');
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBusiness = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, slug, description, settings, planId } = req.body;
    
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
    const { name, slug, description, settings, planId } = req.body;
    const business = await Business.findById(req.params.id);

    if (business) {
      business.name = name || business.name;
      business.slug = slug || business.slug;
      business.description = description || business.description;
      business.settings = settings || business.settings;
      if (planId !== undefined) {
        (business as any).planId = planId;
      }

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
      await business.deleteOne();
      await User.deleteMany({ businessId: business._id });
      await Appointment.deleteMany({ businessId: business._id });
      res.json({ message: 'Business removed' });
    } else {
      res.status(404).json({ message: 'Business not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBusinessAdmins = async (req: Request, res: Response): Promise<any> => {
  try {
    const admins = await User.find({ role: UserRole.BUSINESS_ADMIN }).populate('businessId', 'name slug');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBusinessAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, businessId } = req.body;
    const user = await User.findById(req.params.id);

    if (user && user.role === UserRole.BUSINESS_ADMIN) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.businessId = businessId || user.businessId;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBusinessAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role === UserRole.BUSINESS_ADMIN) {
      await user.deleteOne();
      res.json({ message: 'Admin removed' });
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
