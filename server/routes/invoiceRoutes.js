import express from 'express';
const router = express.Router();
import { createInvoice } from '../controllers/invoiceController.js'; // Note les accolades {} et le .js
import { protect, authorize } from '../middleware/auth.js';

// Toutes les routes factures nécessitent d'être connecté
router.use(protect);

router.post('/', createInvoice);
// Plus tard : router.get('/:id', invoiceController.getInvoiceById);

export default router;