import express from 'express';
const router = express.Router();
import { createClient } from '../controllers/clientController.js'; // Note les accolades {} et le .js
import { protect, authorize } from '../middleware/auth.js';

router.use(protect);
router.post('/', createClient);

export default router;