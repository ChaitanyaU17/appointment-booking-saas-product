import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Plan from '../models/Plan';
import Business from '../models/Business';

export const getPlans = async (req: Request, res: Response): Promise<any> => {
  try {
    const plans = await Plan.find({}).sort({ displayOrder: 1, createdAt: 1 });

    const plansWithCounts = await Promise.all(
      plans.map(async (plan) => {
        const businessCount = await Business.countDocuments({ planId: plan._id });
        return { ...plan.toObject(), businessCount };
      })
    );

    res.json(plansWithCounts);
  } catch (error: any) {
    console.error('getPlans error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getPlanById = async (req: Request, res: Response): Promise<any> => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    const businessCount = await Business.countDocuments({ planId: plan._id });
    res.json({ ...plan.toObject(), businessCount });
  } catch (error: any) {
    console.error('getPlanById error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const createPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { 
      name, slug, currency, displayOrder, variants,
      planType, numberOfShops, numberOfUsers, oneTimeFee,
      gstSettings, planLimits, isPublic, controls,
      // Legacy compatibility
      price, billingCycle, isActive, isDefault 
    } = req.body;

    const trimmedName = (name || '').trim();
    const trimmedSlug = (slug || '').trim().toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({ message: 'Plan name is required' });
    }
    if (!trimmedSlug) {
      return res.status(400).json({ message: 'Plan slug is required' });
    }

    const exists = await Plan.findOne({ $or: [{ name: trimmedName }, { slug: trimmedSlug }] });
    if (exists) {
      return res.status(400).json({ 
        message: exists.name === trimmedName 
          ? 'Plan with this name already exists' 
          : 'Plan with this slug already exists' 
      });
    }

    if (isDefault) {
      await Plan.updateMany({}, { isDefault: false });
    }

    const allowedCycles = ['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time'];
    const cleanedVariants = Array.isArray(variants) ? variants.map((v: any, index: number) => {
      const vName = (v.name || '').trim();
      if (!vName) {
        throw new Error(`Variant #${index + 1} must have a title`);
      }
      const cycle = v.billingCycle || 'monthly';
      if (!allowedCycles.includes(cycle)) {
        throw new Error(`Variant "${vName}" has invalid billing cycle: ${cycle}`);
      }
      const durationDays = Number(v.durationDays);
      if (isNaN(durationDays) || durationDays <= 0) {
        throw new Error(`Variant "${vName}" duration must be at least 1 day`);
      }
      const pPrice = Number(v.price);
      if (isNaN(pPrice) || pPrice < 0) {
        throw new Error(`Variant "${vName}" price cannot be negative or invalid`);
      }

      const cleaned: any = {
        name: vName,
        billingCycle: cycle,
        durationDays,
        price: pPrice
      };

      if (v._id && typeof v._id === 'string' && mongoose.Types.ObjectId.isValid(v._id)) {
        cleaned._id = new mongoose.Types.ObjectId(v._id);
      }

      return cleaned;
    }) : [];

    const plan = new Plan({
      name: trimmedName,
      slug: trimmedSlug,
      currency: currency || 'INR',
      displayOrder: Number(displayOrder) || 0,
      variants: cleanedVariants,
      planType: planType || 'PRIMARY',
      numberOfShops: Number(numberOfShops) || 1,
      numberOfUsers: Number(numberOfUsers) || 1,
      oneTimeFee: Number(oneTimeFee) || 0,
      gstSettings: gstSettings || { type: 'exclusive', rate: 18 },
      planLimits: planLimits || { maxBookingsPerMonth: 50, maxServices: 5, maxAdmins: 1 },
      isPublic: Boolean(isPublic),
      controls: controls || [],
      // Legacy compatibility
      price: Number(price) || 0,
      billingCycle: billingCycle || 'monthly',
      isActive: isActive !== undefined ? isActive : true,
      isDefault: Boolean(isDefault)
    });

    const createdPlan = await plan.save();
    res.status(201).json({ ...createdPlan.toObject(), businessCount: 0 });
  } catch (error: any) {
    console.error('createPlan error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e: any) => e.message).join(', ');
      return res.status(400).json({ message: messages || error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Plan name or slug already exists' });
    }
    res.status(400).json({ message: error.message || 'Failed to create plan' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { 
      name, slug, currency, displayOrder, variants,
      planType, numberOfShops, numberOfUsers, oneTimeFee,
      gstSettings, planLimits, isPublic, controls,
      // Legacy compatibility
      price, billingCycle, isActive, isDefault 
    } = req.body;
    
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (isDefault && !plan.isDefault) {
      await Plan.updateMany({ _id: { $ne: plan._id } }, { isDefault: false });
    }

    const trimmedName = name !== undefined ? String(name).trim() : plan.name;
    const trimmedSlug = slug !== undefined ? String(slug).trim().toLowerCase() : plan.slug;

    if (!trimmedName) {
      return res.status(400).json({ message: 'Plan name cannot be empty' });
    }
    if (!trimmedSlug) {
      return res.status(400).json({ message: 'Plan slug cannot be empty' });
    }

    // Check uniqueness against OTHER plans
    if (trimmedName !== plan.name || trimmedSlug !== plan.slug) {
      const exists = await Plan.findOne({
        _id: { $ne: plan._id },
        $or: [{ name: trimmedName }, { slug: trimmedSlug }]
      });
      if (exists) {
        return res.status(400).json({ 
          message: exists.name === trimmedName 
            ? 'Another plan with this name already exists' 
            : 'Another plan with this slug already exists' 
        });
      }
    }

    plan.name = trimmedName;
    plan.slug = trimmedSlug;
    if (currency !== undefined) plan.currency = currency;
    if (displayOrder !== undefined) plan.displayOrder = Number(displayOrder) || 0;
    
    if (variants !== undefined) {
      if (!Array.isArray(variants)) {
        return res.status(400).json({ message: 'Variants must be an array' });
      }

      const allowedCycles = ['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time'];
      const cleanedVariants = variants.map((v: any, index: number) => {
        const vName = (v.name || '').trim();
        if (!vName) {
          throw new Error(`Variant #${index + 1} must have a title`);
        }
        const cycle = v.billingCycle || 'monthly';
        if (!allowedCycles.includes(cycle)) {
          throw new Error(`Variant "${vName}" has invalid billing cycle: ${cycle}`);
        }
        const durationDays = Number(v.durationDays);
        if (isNaN(durationDays) || durationDays <= 0) {
          throw new Error(`Variant "${vName}" duration must be at least 1 day`);
        }
        const pPrice = Number(v.price);
        if (isNaN(pPrice) || pPrice < 0) {
          throw new Error(`Variant "${vName}" price cannot be negative or invalid`);
        }

        const cleaned: any = {
          name: vName,
          billingCycle: cycle,
          durationDays,
          price: pPrice
        };

        // If _id is present and a valid ObjectId string or ObjectId, retain it
        if (v._id && typeof v._id === 'string' && mongoose.Types.ObjectId.isValid(v._id)) {
          cleaned._id = new mongoose.Types.ObjectId(v._id);
        } else if (v._id instanceof mongoose.Types.ObjectId) {
          cleaned._id = v._id;
        }

        return cleaned;
      });

      plan.variants = cleanedVariants as any;
    }
    
    if (planType !== undefined) plan.planType = planType;
    if (numberOfShops !== undefined) plan.numberOfShops = Number(numberOfShops) || 1;
    if (numberOfUsers !== undefined) plan.numberOfUsers = Number(numberOfUsers) || 1;
    if (oneTimeFee !== undefined) plan.oneTimeFee = Number(oneTimeFee) || 0;
    if (gstSettings !== undefined) plan.gstSettings = gstSettings;
    if (planLimits !== undefined) plan.planLimits = planLimits;
    if (isPublic !== undefined) plan.isPublic = isPublic;
    if (controls !== undefined) plan.controls = controls;

    // Legacy
    if (price !== undefined) plan.price = Number(price) || 0;
    if (billingCycle !== undefined) plan.billingCycle = billingCycle;
    if (isActive !== undefined) plan.isActive = isActive;
    if (isDefault !== undefined) plan.isDefault = isDefault;

    const updatedPlan = await plan.save();
    const businessCount = await Business.countDocuments({ planId: updatedPlan._id });
    res.json({ ...updatedPlan.toObject(), businessCount });
  } catch (error: any) {
    console.error('updatePlan error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e: any) => e.message).join(', ');
      return res.status(400).json({ message: messages || error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Plan name or slug already exists' });
    }
    res.status(400).json({ message: error.message || 'Failed to update plan' });
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const businessCount = await Business.countDocuments({ planId: plan._id });
    if (businessCount > 0) {
      return res.status(400).json({
        message: `Cannot delete plan with ${businessCount} active business(es). Reassign them first.`,
      });
    }

    await plan.deleteOne();
    res.json({ message: 'Plan removed' });
  } catch (error: any) {
    console.error('deletePlan error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const togglePlanStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    plan.isPublic = !plan.isPublic; // Using isPublic for toggle now
    const updatedPlan = await plan.save();
    const businessCount = await Business.countDocuments({ planId: updatedPlan._id });
    res.json({ ...updatedPlan.toObject(), businessCount });
  } catch (error: any) {
    console.error('togglePlanStatus error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
