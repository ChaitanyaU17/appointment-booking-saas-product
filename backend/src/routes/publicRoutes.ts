import express from 'express';
import { getBusinessBySlug, getAvailableTimeSlots, bookAppointment, getMyUpcomingAppointments, getPublicPlans } from '../controllers/publicController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/plans', getPublicPlans);
router.get('/business/:slug', getBusinessBySlug);
router.get('/business/:slug/slots', getAvailableTimeSlots);
router.post('/business/:slug/book', bookAppointment);
router.get('/business/:slug/my-appointments', protect, getMyUpcomingAppointments);

export default router;
