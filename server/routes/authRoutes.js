const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // On importe ta fonction
const { protect, authorize } = require('../middleware/auth');

// C'est ici que tu définis l'Endpoint
// L'URL finale sera : POST /api/auth/login
router.post('/login', authController.login);
if (process.env.NODE_ENV === 'development') {
    router.post('/register', authController.register);
} else {
    router.post('/register', protect, authorize('admin'), authController.register);
}  

module.exports = router;