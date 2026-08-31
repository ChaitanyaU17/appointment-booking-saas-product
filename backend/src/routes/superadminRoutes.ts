import express from 'express';
import {
  getDashboardStats,
  getBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessAdmins,
  createBusinessAdmin,
  updateBusinessAdmin,
  deleteBusinessAdmin
} from '../controllers/superadminController';
import { protect } from '../middlewares/authMiddleware';
import { isSuperadmin } from '../middlewares/roleMiddleware';

const router = express.Router();

router.use(protect, isSuperadmin);

router.get('/dashboard', getDashboardStats);

router.route('/businesses')
  .get(getBusinesses)
  .post(createBusiness);

router.route('/businesses/:id')
  .put(updateBusiness)
  .delete(deleteBusiness);

router.route('/admins')
  .get(getBusinessAdmins)
  .post(createBusinessAdmin);

router.route('/admins/:id')
  .put(updateBusinessAdmin)
  .delete(deleteBusinessAdmin);

export default router;
