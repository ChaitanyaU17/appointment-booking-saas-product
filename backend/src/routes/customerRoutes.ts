import express from 'express';
import { getCustomerAppointments, cancelAppointment } from '../controllers/customerController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/appointments', getCustomerAppointments);
router.put('/appointments/:id/cancel', cancelAppointment);

export default router;
