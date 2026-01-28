const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // On importe ta fonction

// C'est ici que tu définis l'Endpoint
// L'URL finale sera : POST /api/auth/login
router.post('/login', authController.login);

// Tu pourras ajouter d'autres routes ici plus tard, ex:
// router.post('/register', authController.register);
// router.post('/forgot-password', authController.forgotPassword);

module.exports = router;