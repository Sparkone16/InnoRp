import express from 'express';
const router = express.Router();
import { login, register } from '../controllers/authController.js'; // Note les accolades {} et le .js
import { protect, authorize } from '../middleware/auth.js';

// C'est ici que tu définis l'Endpoint
// L'URL finale sera : POST /api/auth/login

router.post('/login', login);
if (process.env.NODE_ENV === 'development') {
    router.post('/register', register);
} else {
    router.post('/register', protect, authorize('admin'), register);
}  

export default router;