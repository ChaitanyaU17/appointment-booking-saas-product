import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { isAgent } from '../middlewares/roleMiddleware';
import {
  getAgentProfile,
  getAgentDashboardStats,
  getAssignedShops,
  registerShopByAgent,
  getShopDetails,
  updateShopProfile,
  updateShopOnboarding,
  getAgentAppointments,
  updateAgentAppointmentStatus,
  getAgentPlans,
  getAgentRegistrationShops,
  getAgentExpiredShops,
  getAgentBusinessAdmins,
  agentCreateBusinessAdmin,
  agentUpdateBusinessAdmin,
  agentDeleteBusinessAdmin,
  getAgentCoupons,
  getAgentDemoRequests,
  getAgentPayments,
  agentCreateDemo,
  agentMarkDemoConducted,
  agentApproveBusiness,
  agentRejectBusiness,
  agentRequestBusinessChanges,
  agentActivateTrial,
  agentGeneratePaymentLink,
  agentDeleteShop,
} from '../controllers/agentController';

const router = express.Router();

// Require authenticated user with Agent role
router.use(protect, isAgent);

router.get('/profile', getAgentProfile);
router.get('/dashboard-stats', getAgentDashboardStats);
router.get('/plans', getAgentPlans);

router.get('/shops', getAssignedShops);
router.post('/shops/register', registerShopByAgent);
router.post('/register-shop', registerShopByAgent);
router.get('/shops/:id', getShopDetails);
router.delete('/shops/:id', agentDeleteShop);
router.put('/shops/:id/profile', updateShopProfile);
router.put('/shops/:id/onboarding', updateShopOnboarding);

// Scoped Superadmin Modules Delegated to Agent
router.get('/registration-shops', getAgentRegistrationShops);
router.get('/expired-shops', getAgentExpiredShops);
router.route('/admins')
  .get(getAgentBusinessAdmins)
  .post(agentCreateBusinessAdmin);
router.route('/admins/:id')
  .put(agentUpdateBusinessAdmin)
  .delete(agentDeleteBusinessAdmin);
router.get('/coupons', getAgentCoupons);
router.get('/demo-requests', getAgentDemoRequests);
router.get('/payments', getAgentPayments);

// Full Onboarding Pipeline endpoints for assigned shops
router.post('/shops/:id/create-demo', agentCreateDemo);
router.put('/shops/:id/mark-demo-conducted', agentMarkDemoConducted);
router.put('/shops/:id/approve', agentApproveBusiness);
router.put('/shops/:id/reject', agentRejectBusiness);
router.put('/shops/:id/request-changes', agentRequestBusinessChanges);
router.put('/shops/:id/activate-trial', agentActivateTrial);
router.post('/shops/:id/generate-payment-link', agentGeneratePaymentLink);

router.get('/appointments', getAgentAppointments);
router.put('/appointments/:appointmentId/status', updateAgentAppointmentStatus);

export default router;
