const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// @desc    Créer une nouvelle facture
// @route   POST /api/invoices
// @access  Private (Connecté)
exports.createInvoice = async (req, res) => {
    try {
        const { clientId, items, dueAt, notes, paymentConditions } = req.body;

        // 1. Validation basique
        if (!clientId || !items || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Veuillez fournir un client et au moins un article." 
            });
        }

        // 2. Vérifier que le client existe vraiment
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ 
                success: false, 
                message: "Client introuvable." 
            });
        }

        // 3. Création de l'objet Facture
        // On attache l'ID de l'utilisateur connecté (req.user._id) qui vient du middleware 'protect'
        const invoice = new Invoice({
            client: clientId,
            user: req.user._id, // L'auteur de la facture
            items: items,
            dueAt: dueAt,
            notes: notes,
            paymentConditions: paymentConditions
            // Pas besoin de passer invoiceNumber, totalHT, etc. (Calculés auto)
        });

        // 4. Sauvegarde (Déclenche les calculs et la numérotation FAC-2026-...)
        const savedInvoice = await invoice.save();

        // 5. On renvoie la facture complète (avec les totaux calculés)
        // .populate('client') permet de renvoyer les infos du client (Nom, Adresse) 
        // directement dans la réponse, pas juste son ID. Très pratique pour le Front.
        const populatedInvoice = await Invoice.findById(savedInvoice._id)
            .populate('client', 'name firstname email address type')
            .populate('user', 'firstname lastname');

        res.status(201).json({
            success: true,
            data: populatedInvoice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la création de la facture." });
    }
};