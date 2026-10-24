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
import { isSuperadmin, isSuperadminOrAgent } from '../middlewares/roleMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(isSuperadminOrAgent, getPlans)
  .post(isSuperadmin, createPlan);

router.route('/:id')
  .get(isSuperadminOrAgent, getPlanById)
  .put(isSuperadmin, updatePlan)
  .delete(isSuperadmin, deletePlan);

router.put('/:id/toggle', isSuperadmin, togglePlanStatus);

export default router;
