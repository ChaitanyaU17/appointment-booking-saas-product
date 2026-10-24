import Business from '../models/Business';
import Plan from '../models/Plan';

export const isBusinessExpired = async (business: any): Promise<boolean> => {
  // Check subscriptionEnd first (most reliable)
  if (business.subscriptionEnd) {
    return new Date(business.subscriptionEnd).getTime() < Date.now();
  }

  // Check planEndDate
  if (business.planEndDate) {
    return new Date(business.planEndDate).getTime() < Date.now();
  }

  // Check active trial
  if (business.trialStatus === 'Active' && business.trialEndsAt) {
    return new Date(business.trialEndsAt).getTime() < Date.now();
  }

  // Calculate from plan variant duration if available
  if (business.planId) {
    const planId = typeof business.planId === 'object' ? business.planId._id : business.planId;
    const plan = await Plan.findById(planId);
    if (plan) {
      const variantId = business.planVariantId || business.paymentBreakdown?.planVariantId;
      const variant = plan.variants?.find((v: any) => v._id?.toString() === variantId?.toString()) || plan.variants?.[0];
      if (variant && variant.durationDays && variant.billingCycle !== 'one-time' && !(plan as any).isPermanent) {
        const start = new Date(business.planStartDate || business.subscriptionStart || business.createdAt || Date.now());
        const end = new Date(start.getTime() + variant.durationDays * 24 * 60 * 60 * 1000);
        return end.getTime() < Date.now();
      }
    }
  }

  // If no expiry data exists, the business is not expired
  return false;
};
