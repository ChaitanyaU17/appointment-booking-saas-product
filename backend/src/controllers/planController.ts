import { Request, Response } from 'express';
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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

    const exists = await Plan.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res.status(400).json({ message: 'Plan with this name or slug already exists' });
    }

    if (isDefault) {
      await Plan.updateMany({}, { isDefault: false });
    }

    const plan = new Plan({
      name, slug, currency, displayOrder, variants: variants || [],
      planType, numberOfShops, numberOfUsers, oneTimeFee,
      gstSettings, planLimits, isPublic, controls: controls || [],
      // Legacy compatibility
      price, billingCycle, isActive, isDefault
    });

    const createdPlan = await plan.save();
    res.status(201).json({ ...createdPlan.toObject(), businessCount: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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

    plan.name = name ?? plan.name;
    plan.slug = slug ?? plan.slug;
    plan.currency = currency ?? plan.currency;
    plan.displayOrder = displayOrder ?? plan.displayOrder;
    if (variants !== undefined) plan.variants = variants;
    
    plan.planType = planType ?? plan.planType;
    plan.numberOfShops = numberOfShops ?? plan.numberOfShops;
    plan.numberOfUsers = numberOfUsers ?? plan.numberOfUsers;
    plan.oneTimeFee = oneTimeFee ?? plan.oneTimeFee;
    if (gstSettings !== undefined) plan.gstSettings = gstSettings;
    if (planLimits !== undefined) plan.planLimits = planLimits;
    plan.isPublic = isPublic ?? plan.isPublic;
    if (controls !== undefined) plan.controls = controls;

    // Legacy
    if (price !== undefined) plan.price = price;
    if (billingCycle !== undefined) plan.billingCycle = billingCycle;
    if (isActive !== undefined) plan.isActive = isActive;
    if (isDefault !== undefined) plan.isDefault = isDefault;

    const updatedPlan = await plan.save();
    const businessCount = await Business.countDocuments({ planId: updatedPlan._id });
    res.json({ ...updatedPlan.toObject(), businessCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
