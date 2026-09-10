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
      console.log(`[Cron] Successfully processed ${expiredBusinesses.length} expired trials.`);
    } catch (error) {
      console.error("[Cron] Error during trial expiry job:", error);
    }
  });
  console.log("Trial expiry cron job initialized.");
};