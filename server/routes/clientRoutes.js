const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController'); // On importe ta fonction
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', clientController.createClient)
module.exports = router;