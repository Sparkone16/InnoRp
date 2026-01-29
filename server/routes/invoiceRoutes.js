import express from 'express';
const router = express.Router();
import { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, updateInvoiceStatus, deleteInvoice } from '../controllers/invoiceController.js'; // Note les accolades {} et le .js
import { protect, authorize } from '../middleware/auth.js';

// Toutes les routes factures nécessitent d'être connecté
router.use(protect);

router.get('/', getAllInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.patch('/:id/status', updateInvoiceStatus); // Nouvelle route pour les boutons


export default router;