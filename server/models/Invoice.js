import mongoose from 'mongoose';
import Counter from './Counter.js';

// Sous-schéma pour les lignes de facture
const InvoiceItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.1 },
    unitPrice: { type: Number, required: true },
    totalLine: { type: Number }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
    // 1. Identification
    invoiceNumber: {
        type: String,
        unique: true,
        sparse: true // Permet d'avoir des factures sans numéro (draft)
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },

    // 2. Relations
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assure-toi d'avoir un modèle User, sinon mets en commentaire
        // required: true 
    },

    // 3. Dates clés
    issuedAt: { type: Date, default: Date.now },
    dueAt: { type: Date, required: true },
    paidAt: { type: Date },

    // 4. Contenu
    items: [InvoiceItemSchema],

    // 5. Totaux
    tvaRate: { type: Number, default: 20 },
    totalHT: { type: Number, default: 0 },
    totalTVA: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 },

    // 6. Infos
    paymentConditions: { type: String, default: "Paiement à réception" },
    notes: { type: String },
    
    // Archivage (Soft Delete)
    isArchived: { type: Boolean, default: false }

}, {
    timestamps: true
});

// --- HOOK 1 : CALCULS AUTOMATIQUES ---
// Pas besoin d'async ici car c'est du calcul pur, mais on garde la signature standard
InvoiceSchema.pre('save', function() {
    // Note : Pas de "next" dans les arguments
    
    let ht = 0;

    // Calcul des lignes
    if (this.items && this.items.length > 0) {
        this.items.forEach(item => {
            item.totalLine = item.quantity * item.unitPrice;
            ht += item.totalLine;
        });
    }

    this.totalHT = ht;
    
    // Calcul TVA et TTC
    this.totalTVA = (this.totalHT * this.tvaRate) / 100;
    this.totalTTC = this.totalHT + this.totalTVA;
    
    // Arrondis
    this.totalHT = Math.round(this.totalHT * 100) / 100;
    this.totalTVA = Math.round(this.totalTVA * 100) / 100;
    this.totalTTC = Math.round(this.totalTTC * 100) / 100;

    // Avec Mongoose moderne, si on ne retourne rien (ou une promesse résolue), ça continue.
});

// --- HOOK 2 : GÉNÉRATION DU NUMÉRO DE FACTURE ---
InvoiceSchema.pre('save', async function() {
    // Note : Pas de "next" ici non plus, on utilise async/await pur
    
    // 1. Si déjà un numéro, on arrête
    if (this.invoiceNumber) return;

    // 2. Si brouillon, on arrête (pas de numéro)
    if (this.status === 'draft') return;

    // 3. Génération du numéro
    const today = new Date();
    const year = today.getFullYear();
    const counterId = `invoice_${year}`;

    try {
        const counter = await Counter.findByIdAndUpdate(
            counterId,
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const sequence = counter.seq.toString().padStart(4, '0');
        this.invoiceNumber = `FAC-${year}-${sequence}`;
        
        // Pas besoin de return next(), la fin de la fonction async suffit
    } catch (error) {
        // En cas d'erreur, on la lance pour arrêter la sauvegarde
        throw new Error("Erreur lors de la génération du numéro de facture : " + error.message);
    }
});

export default mongoose.model('Invoice', InvoiceSchema);