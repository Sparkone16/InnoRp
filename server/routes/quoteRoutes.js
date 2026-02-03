import express from 'express';
import {
    createQuote,
    getAllQuotes,
    getQuoteById,
    updateQuote,
    deleteQuote
} from '../controllers/quoteController.js';
import { protect } from '../middleware/authMiddleware.js'; // Ton middleware d'auth

const router = express.Router();

router.use(protect); // Toutes les routes sont protégées

router.route('/')
    .get(getAllQuotes)
    .post(createQuote);

router.route('/:id')
    .get(getQuoteById)
    .put(updateQuote)
    .delete(deleteQuote);

export default router;