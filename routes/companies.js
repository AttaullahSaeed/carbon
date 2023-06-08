import express from 'express';
import { refreshTokens, signIn, signUp } from '../controllers/companies.js';
import { authenticateJWT } from '../middleware/middleware.js';
import { createVehicle } from '../controllers/vehicle.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh_token', refreshTokens);
router.post('/vehicle', authenticateJWT, createVehicle);
export default router;
