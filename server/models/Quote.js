import mongoose from 'mongoose';

const QuoteItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.1 },
    unitPrice: { type: Number, required: true },
    totalLine: { type: Number }
}, { _id: false });

const QuoteSchema = new mongoose.Schema({
    quoteNumber: { type: String, unique: true }, // Sera généré (ex: DEV-2026-01)
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
    items: [QuoteItemSchema],
    totalHT: Number,
    totalTVA: Number,
    totalTTC: Number,
    status: {
        type: String,
        enum: ['draft', 'sent', 'accepted', 'rejected'],
        default: 'draft'
    },
    issuedAt: { type: Date, default: Date.now },
    validUntil: { type: Date } // Date de validité du devis
}, { timestamps: true });

// Hook pour générer le numéro de Devis avant sauvegarde
QuoteSchema.pre('save', async function (next) {
    if (!this.quoteNumber && this.status !== 'draft') {
        const date = new Date();
        const year = date.getFullYear();
        // Logique simplifiée : Compte le nombre de devis de l'année pour incrémenter
        const count = await mongoose.model('Quote').countDocuments({
            quoteNumber: { $regex: `DEV-${year}` }
        });
        const num = (count + 1).toString().padStart(4, '0');
        this.quoteNumber = `DEV-${year}-${num}`;
    }
    next();
});

export default mongoose.model('Quote', QuoteSchema);