import cron from "node-cron";
import Business from "../models/Business";

export const startTrialExpiryJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Running trial expiry job...");
    try {
      const now = new Date();
      const expiredBusinesses = await Business.find({
        trialStatus: "Active",
        trialEndsAt: { $lt: now }
      });
      if (expiredBusinesses.length === 0) return;

      for (const biz of expiredBusinesses) {
        biz.planId = biz.originalPlanId || undefined;
        biz.trialStatus = "Expired";
        await biz.save();
        console.log(`[Cron] Trial expired for business: ${biz.name} (${biz._id})`);
      }
      if (expiredBusinesses.length > 0) {
        console.log(`[Cron] Successfully processed ${expiredBusinesses.length} expired trials.`);
      }

      // Check for regular subscription expiry
      const expiredSubscriptions = await Business.find({
        subscriptionStatus: "active",
        $or: [
          { subscriptionEnd: { $lt: now } },
          { planEndDate: { $lt: now } }
        ]
      });

      for (const biz of expiredSubscriptions) {
        biz.subscriptionStatus = "expired";
        await biz.save();
        console.log(`[Cron] Subscription expired for business: ${biz.name} (${biz._id})`);
      }
      if (expiredSubscriptions.length > 0) {
        console.log(`[Cron] Successfully processed ${expiredSubscriptions.length} expired subscriptions.`);
      }

    } catch (error) {
      console.error("[Cron] Error during trial expiry job:", error);
    }
  });
  console.log("Trial expiry cron job initialized.");
};