import express from 'express';
const router = express.Router();
import { authorize, protect } from '../middleware/auth.js'; // "authorize" n'est pas utilisé ici pour l'instant
import { updateUserProfile, getUserProfile, getAllProfiles, getUserById, updateUserById} from '../controllers/userController.js';

// Toutes les routes ci-dessous sont protégées par le token
router.use(protect);

router.get('/all', authorize('comptable', 'admin'), getAllProfiles);
// GET /  -> Récupère le profil
// PUT /  -> Modifie le profil
router.route("/")
    .get(getUserProfile)
    .put(updateUserProfile);

router.route("/:id")
    .get(getUserById)
    .put(updateUserById);

export default router;