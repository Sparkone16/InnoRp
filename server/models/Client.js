import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    // 1. Le type de client
    type: {
        type: String,
        enum: ['company', 'individual'],
        default: 'company',
        required: true
    },

    // 2. Identité
    name: {
        type: String,
        required: [true, "Le nom (ou raison sociale) est obligatoire"],
        trim: true
    },
    firstname: {
        type: String,
        trim: true
    },
    
    // --- AJOUT MANQUANT 1 : Le contact pour les entreprises ---
    contactName: {
        type: String,
        trim: true
    },

    // 3. Coordonnées
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        match: [/\S+@\S+\.\S+/, "Email invalide"],
        lowercase: true, // Ajout conseillé : force l'email en minuscule
        trim: true
    },
    phone: { type: String, trim: true },

    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'France' }
    },

    // 4. Infos Légales
    siret: {
        type: String,
        trim: true,
        // Validation : Obligatoire seulement si c'est une entreprise
        required: function() { return this.type === 'company'; }
    },
    vatNumber: {
        type: String,
        trim: true
    },

    // --- AJOUT MANQUANT 2 : Les notes internes ---
    notes: {
        type: String
    },

    // 5. État (Pour le Soft Delete)
    isActive: { type: Boolean, default: true }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- VIRTUALS ---
ClientSchema.virtual('displayName').get(function() {
    if (this.type === 'individual' && this.firstname) {
        return `${this.name} ${this.firstname}`;
    }
    return this.name;
});

export default mongoose.model('Client', ClientSchema);