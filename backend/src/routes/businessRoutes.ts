import express from 'express';
import {
  getBusinessDashboardStats,
  getBusinessSettings,
  updateBusinessSettings,
  updateBusinessPlan,
  getBusinessAppointments,
  createManualAppointment,
  updateAppointmentStatus,
  recordPayment,
  getServices,
  createService,
  updateService,
  deleteService
} from '../controllers/businessController';
import { protect } from '../middlewares/authMiddleware';
import { isBusinessAdmin } from '../middlewares/roleMiddleware';

const router = express.Router();

router.use(protect, isBusinessAdmin);

router.get('/dashboard', getBusinessDashboardStats);

router.route('/settings')
  .get(getBusinessSettings)
  .put(updateBusinessSettings);

router.put('/settings/plan', updateBusinessPlan);

router.route('/appointments')
  .get(getBusinessAppointments)
  .post(createManualAppointment);

router.put('/appointments/:id/status', updateAppointmentStatus);
router.put('/appointments/:id/payment', recordPayment);

router.route('/services')
  .get(getServices)
  .post(createService);

router.route('/services/:id')
  .put(updateService)
  .delete(deleteService);

export default router;
