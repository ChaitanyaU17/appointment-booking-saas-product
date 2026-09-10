import express from 'express';
import { register, login, logout, getMe, getGoogleAuthUrl, googleCallback } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

router.get('/google', getGoogleAuthUrl);
router.get('/google/callback', googleCallback);

export default router;
