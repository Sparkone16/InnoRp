const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // On importe ta fonction
const { protect } = require('../middleware/auth');

// Toutes les routes factures nécessitent d'être connecté
router.use(protect);

router.post('/', invoiceController.createInvoice);
// Plus tard : router.get('/:id', invoiceController.getInvoiceById);

module.exports = router;