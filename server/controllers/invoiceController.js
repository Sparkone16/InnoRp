import Invoice from '../models/Invoice.js';

// @desc    Créer une facture
// @route   POST /api/invoices
export const createInvoice = async (req, res) => {
    try {
        // Le user est récupéré via le token (req.user.id) si tu as le middleware d'auth
        // Sinon on le passe dans le body
        const invoiceData = { ...req.body, user: req.user._id };
        
        const invoice = new Invoice(invoiceData);
        await invoice.save(); // Déclenche les calculs auto

        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Récupérer toutes les factures (Non archivées)
// @route   GET /api/invoices
export const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ isArchived: false })
            .populate('client', 'name email type firstname contactName') // On récupère les infos client
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: invoices.length, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

// @desc    Récupérer une facture
// @route   GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('client');
        if (!invoice || invoice.isArchived) {
            return res.status(404).json({ success: false, message: "Facture introuvable" });
        }
        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

// @desc    Mettre à jour une facture (Recalcule les totaux)
// @route   PUT /api/invoices/:id
export const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: "Facture introuvable" });

        // Si la facture est déjà payée ou envoyée, on empêche la modif (Logique métier optionnelle)
        // if (invoice.status === 'paid') return res.status(400).json({ message: "Impossible de modifier une facture payée" });

        // Mise à jour des champs
        Object.assign(invoice, req.body);
        
        // IMPORTANT : .save() déclenche ton middleware de calcul (TVA, HT, TTC)
        await invoice.save();

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Archiver une facture (Soft Delete)
// @route   DELETE /api/invoices/:id
export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: "Facture introuvable" });

        invoice.isArchived = true;
        await invoice.save();

        res.status(200).json({ success: true, message: "Facture archivée avec succès" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

// @desc    Changer le statut (Actions boutons)
// @route   PATCH /api/invoices/:id/status
export const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'sent', 'paid', 'cancelled'
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) return res.status(404).json({ success: false, message: "Facture introuvable" });

        invoice.status = status;

        // Si on passe en 'paid', on met la date de paiement
        if (status === 'paid') {
            invoice.paidAt = new Date();
        } else {
            invoice.paidAt = undefined; // On reset si on annule le paiement
        }

        // Le .save() va aussi générer le numéro de facture si on passe de 'draft' à 'sent'
        // grâce à ton hook pre('save') !
        await invoice.save();

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};