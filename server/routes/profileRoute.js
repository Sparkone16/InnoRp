import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js'; // "authorize" n'est pas utilisé ici pour l'instant
import { updateUserProfile, getUserProfile } from '../controllers/userController.js';

// Toutes les routes ci-dessous sont protégées par le token
router.use(protect);

// GET /  -> Récupère le profil
// PUT /  -> Modifie le profil
router.route("/")
    .get(getUserProfile)
    .put(updateUserProfile);

export default router;