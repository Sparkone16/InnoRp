import express from 'express';
const router = express.Router();
import { createClient, deleteClient, getAllClients, getClientById, updateClient } from '../controllers/clientController.js'; // Note les accolades {} et le .js
import { protect, authorize } from '../middleware/auth.js';

router.use(protect);
router.post('/', createClient);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.delete('/:id', deleteClient);
router.put('/:id', updateClient);

export default router;