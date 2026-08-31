import express from 'express';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus
} from '../controllers/planController';
import { protect } from '../middlewares/authMiddleware';
import { isSuperadmin } from '../middlewares/roleMiddleware';

const router = express.Router();

router.use(protect, isSuperadmin);

router.route('/')
  .get(getPlans)
  .post(createPlan);

router.route('/:id')
  .get(getPlanById)
  .put(updatePlan)
  .delete(deletePlan);

router.put('/:id/toggle', togglePlanStatus);

export default router;
