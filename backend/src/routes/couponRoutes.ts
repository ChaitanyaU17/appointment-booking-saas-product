import { Router } from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController';
import { protect } from '../middlewares/authMiddleware';
import { isSuperadmin, isSuperadminOrAgent } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', protect, isSuperadminOrAgent, getCoupons);
router.post('/', protect, isSuperadmin, createCoupon);
router.put('/:id', protect, isSuperadmin, updateCoupon);
router.delete('/:id', protect, isSuperadmin, deleteCoupon);
router.post('/validate', validateCoupon);

export default router;
