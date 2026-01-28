const mongoose = require('mongoose');
const Counter = require('./Counter');

// Sous-schéma pour les lignes de facture (ex: "Développement Backend - 5 jours")
const InvoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true // ex: "Prestation Audit de Sécurité"
    },
    quantity: {
        type: Number,
        required: true,
        min: 0.1 // On peut facturer 0.5 jour
    },
    unitPrice: {
        type: Number,
        required: true // Ton TJM (ex: 500€)
    },
    // Le total de la ligne est calculé, pas besoin de le saisir
    totalLine: {
        type: Number
    }
}, { _id: false }); // Pas besoin d'ID unique pour chaque ligne

const InvoiceSchema = new mongoose.Schema({
    // 1. Identification
    invoiceNumber: {
        type: String,
        required: true,
        unique: true // ex: "FAC-2023-10-001"
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },

    // 2. Relations
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client', // On liera ça à ton futur modèle Client
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Qui a créé la facture (le commercial/admin)
        required: true
    },

    // 3. Dates clés
    issuedAt: {
        type: Date,
        default: Date.now // Date d'émission
    },
    dueAt: {
        type: Date,
        required: true // Date limite de paiement (Échéance)
    },
    paidAt: {
        type: Date // Rempli seulement quand c'est payé
    },

    // 4. Contenu (Prestations)
    items: [InvoiceItemSchema],

    // 5. Totaux Financiers (Calculés automatiquement)
    tvaRate: {
        type: Number,
        default: 20 // 20% par défaut en France
    },
    totalHT: { type: Number, default: 0 },
    totalTVA: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 },

    // 6. Infos légales & Paiement
    paymentConditions: {
        type: String,
        default: "Paiement à réception de facture" // ou "30 jours fin de mois"
    },
    notes: {
        type: String // ex: "Merci pour votre confiance. Virement sur le compte..."
    }

}, {
    timestamps: true
});

// --- AUTOMATISATION (Middleware) ---
// Avant de sauvegarder, on recalcule tous les montants
// C'est la garantie que tes factures sont mathématiquement justes.
InvoiceSchema.pre('save', function(next) {
    let ht = 0;

    // 1. Calculer chaque ligne et le total HT
    this.items.forEach(item => {
        item.totalLine = item.quantity * item.unitPrice;
        ht += item.totalLine;
    });

    this.totalHT = ht;

    // 2. Calculer la TVA
    // Astuce : Math.round pour éviter les bugs de virgules (ex: 14.9999999)
    this.totalTVA = (this.totalHT * this.tvaRate) / 100;

    // 3. Calculer le TTC
    this.totalTTC = this.totalHT + this.totalTVA;
    
    // Arrondir à 2 décimales pour être propre en base
    this.totalHT = Math.round(this.totalHT * 100) / 100;
    this.totalTVA = Math.round(this.totalTVA * 100) / 100;
    this.totalTTC = Math.round(this.totalTTC * 100) / 100;

    next();
});
InvoiceSchema.pre('save', async function(next) {
    // Si la facture a déjà un numéro, on ne fait rien (ex: lors d'une modification)
    if (this.invoiceNumber || this.status === 'draft') {
        return next();
    }

    const today = new Date();
    const year = today.getFullYear(); // 2026
    const counterId = `invoice_${year}`; // On crée un compteur par année

    try {
        // C'est ici la magie ATOMIQUE de MongoDB
        // findOneAndUpdate avec $inc est "thread-safe".
        // Même si 100 personnes cliquent en même temps, MongoDB les traitera un par un.
        const counter = await Counter.findByIdAndUpdate(
            counterId,
            { $inc: { seq: 1 } }, // On incrémente de +1
            { new: true, upsert: true } // "upsert": Si le compteur n'existe pas (le 1er janvier), il le crée
        );

        // On formate le numéro : FAC-2026-0001
        // .toString().padStart(4, '0') transforme 5 en "0005" ou 120 en "0120"
        const sequence = counter.seq.toString().padStart(4, '0');
        
        this.invoiceNumber = `FAC-${year}-${sequence}`;
        
        next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);