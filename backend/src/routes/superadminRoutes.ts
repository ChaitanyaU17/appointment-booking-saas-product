import express from 'express';
import {
  getDashboardStats, getPayments, getSuperadminAppointments,
  getBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessAdmins,
  createBusinessAdmin,
  updateBusinessAdmin,
  deleteBusinessAdmin,
  approveBusiness,
  rejectBusiness,
  requestBusinessChanges,
  activateTrial,
  createDemoForRegistration,
  markDemoConducted,
  getDemoRequests,
  approveDemoRequest,
  rejectDemoRequest,
  deleteDemoRequest,
  generatePaymentLink,
  registerBusinessByAdmin,
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getSuperadminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications
} from '../controllers/superadminController';
import { protect } from '../middlewares/authMiddleware';
import { isSuperadmin } from '../middlewares/roleMiddleware';

const router = express.Router();

router.use(protect, isSuperadmin);

router.get('/dashboard', getDashboardStats);
router.post('/register-business', registerBusinessByAdmin);

router.route('/businesses')
  .get(getBusinesses)
  .post(createBusiness);

router.route('/businesses/:id')
  .put(updateBusiness)
  .delete(deleteBusiness);

router.put('/businesses/:id/approve', approveBusiness);
router.put('/businesses/:id/reject', rejectBusiness);
router.put('/businesses/:id/request-changes', requestBusinessChanges);
router.put('/businesses/:id/activate-trial', activateTrial);
router.post('/businesses/:id/create-demo', createDemoForRegistration);
router.put('/businesses/:id/mark-demo-conducted', markDemoConducted);
router.post('/businesses/:id/generate-payment-link', generatePaymentLink);

router.route('/admins')
  .get(getBusinessAdmins)
  .post(createBusinessAdmin);

router.route('/admins/:id')
  .put(updateBusinessAdmin)
  .delete(deleteBusinessAdmin);

router.get('/demo-requests', getDemoRequests);
router.put('/demo-requests/:id/approve', approveDemoRequest);
router.put('/demo-requests/:id/reject', rejectDemoRequest);
router.delete('/demo-requests/:id', deleteDemoRequest);

router.route('/agents')
  .get(getAgents)
  .post(createAgent);

router.route('/agents/:id')
  .get(getAgentById)
  .put(updateAgent)
  .delete(deleteAgent);

router.get('/payments', getPayments);
router.get('/appointments', getSuperadminAppointments);

router.get('/notifications', getSuperadminNotifications);
router.put('/notifications/mark-all-read', markAllNotificationsAsRead);
router.put('/notifications/:id/read', markNotificationAsRead);
router.delete('/notifications/clear', clearAllNotifications);

export default router;
