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
    const { name, slug, price, currency, billingCycle, isActive, isDefault, features, displayOrder } = req.body;

    const exists = await Plan.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res.status(400).json({ message: 'Plan with this name or slug already exists' });
    }

    if (isDefault) {
      await Plan.updateMany({}, { isDefault: false });
    }

    const plan = new Plan({
      name,
      slug,
      price,
      currency,
      billingCycle,
      isActive,
      isDefault,
      features,
      displayOrder,
    });

    const createdPlan = await plan.save();
    res.status(201).json({ ...createdPlan.toObject(), businessCount: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, slug, price, currency, billingCycle, isActive, isDefault, features, displayOrder } = req.body;
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (isDefault && !plan.isDefault) {
      await Plan.updateMany({ _id: { $ne: plan._id } }, { isDefault: false });
    }

    plan.name = name ?? plan.name;
    plan.slug = slug ?? plan.slug;
    plan.price = price ?? plan.price;
    plan.currency = currency ?? plan.currency;
    plan.billingCycle = billingCycle ?? plan.billingCycle;
    plan.isActive = isActive ?? plan.isActive;
    plan.isDefault = isDefault ?? plan.isDefault;
    plan.features = features ?? plan.features;
    plan.displayOrder = displayOrder ?? plan.displayOrder;

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

    plan.isActive = !plan.isActive;
    const updatedPlan = await plan.save();
    const businessCount = await Business.countDocuments({ planId: updatedPlan._id });
    res.json({ ...updatedPlan.toObject(), businessCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
