import Quote from '../models/Quote.js';
import Client from '../models/Client.js';
import { HTTP_CODE } from '../main.js'; // Tes constantes

// Fonction utilitaire pour calculer les totaux
const calculateTotals = (items) => {
    let totalHT = 0;
    items.forEach(item => {
        item.totalLine = item.quantity * item.unitPrice;
        totalHT += item.totalLine;
    });
    const totalTVA = totalHT * 0.20; // TVA 20%
    const totalTTC = totalHT + totalTVA;
    return { items, totalHT, totalTVA, totalTTC };
};

// @desc    Créer un devis
// @route   POST /api/quotes
export const createQuote = async (req, res) => {
    try {
        const { client, items, validUntil, status } = req.body;

        const calculations = calculateTotals(items);

        const quote = new Quote({
            user: req.user._id, // L'utilisateur connecté
            client,
            items: calculations.items,
            totalHT: calculations.totalHT,
            totalTVA: calculations.totalTVA,
            totalTTC: calculations.totalTTC,
            validUntil,
            status: status || 'draft'
        });

        const createdQuote = await quote.save();
        res.status(HTTP_CODE.CREATED).json(createdQuote);
    } catch (error) {
        res.status(HTTP_CODE.BAD_REQUEST).json({ message: error.message });
    }
};

// @desc    Obtenir tous les devis
// @route   GET /api/quotes
export const getAllQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find({ user: req.user._id })
            .populate('client', 'name email') // On récupère les infos client
            .sort({ createdAt: -1 });
        res.status(HTTP_CODE.OK).json(quotes);
    } catch (error) {
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Obtenir un devis par ID
// @route   GET /api/quotes/:id
export const getQuoteById = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id).populate('client');
        if (quote) {
            res.status(HTTP_CODE.OK).json(quote);
        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: 'Devis introuvable' });
        }
    } catch (error) {
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Mettre à jour un devis
// @route   PUT /api/quotes/:id
export const updateQuote = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);

        if (quote) {
            // Si on envoie de nouveaux items, on recalcule
            if (req.body.items) {
                const calculations = calculateTotals(req.body.items);
                quote.items = calculations.items;
                quote.totalHT = calculations.totalHT;
                quote.totalTVA = calculations.totalTVA;
                quote.totalTTC = calculations.totalTTC;
            }

            quote.client = req.body.client || quote.client;
            quote.validUntil = req.body.validUntil || quote.validUntil;
            quote.status = req.body.status || quote.status;

            // Important pour déclencher le Hook 'pre save' (génération numéro)
            const updatedQuote = await quote.save(); 
            
            res.status(HTTP_CODE.OK).json(updatedQuote);
        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: 'Devis introuvable' });
        }
    } catch (error) {
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Supprimer un devis
// @route   DELETE /api/quotes/:id
export const deleteQuote = async (req, res) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);
        if (quote) {
            res.status(HTTP_CODE.OK).json({ message: 'Devis supprimé' });
        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: 'Devis introuvable' });
        }
    } catch (error) {
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: error.message });
    }
};