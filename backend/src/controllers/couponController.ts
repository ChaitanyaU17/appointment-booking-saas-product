import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

export const getCoupons = async (req: Request, res: Response): Promise<any> => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, description, discountType, discountValue, validityBonusDays, isActive, startDate, expiryDate, maxUsageLimit, minPurchaseAmount, maxDiscountAmount } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    if (isActive) {
      const activeCount = await Coupon.countDocuments({ isActive: true });
      if (activeCount >= 2) {
        return res.status(400).json({ message: 'Maximum of 2 active coupons allowed' });
      }
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      validityBonusDays,
      isActive,
      startDate,
      expiryDate,
      maxUsageLimit,
      minPurchaseAmount,
      maxDiscountAmount
    });

    const saved = await coupon.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { code, description, discountType, discountValue, validityBonusDays, isActive, startDate, expiryDate, maxUsageLimit, minPurchaseAmount, maxDiscountAmount } = req.body;

    if (isActive) {
      const activeCount = await Coupon.countDocuments({ isActive: true, _id: { $ne: id } });
      if (activeCount >= 2) {
        return res.status(400).json({ message: 'Maximum of 2 active coupons allowed' });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, {
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      validityBonusDays,
      isActive,
      startDate,
      expiryDate,
      maxUsageLimit,
      minPurchaseAmount,
      maxDiscountAmount
    }, { new: true });

    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, amount } = req.body; // optionally take amount for minPurchaseAmount check
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({ message: 'Coupon is not yet active' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.maxUsageLimit && coupon.currentUsageCount >= coupon.maxUsageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (amount !== undefined && coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required` });
    }

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
