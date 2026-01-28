import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    // 1. Le type de client (La clé de voûte)
    type: {
        type: String,
        enum: ['company', 'individual'],
        default: 'company',
        required: true
    },

    // 2. Identité
    // Pour une société : c'est la Raison Sociale (ex: "TechCorp")
    // Pour un particulier : c'est le Nom de famille
    name: {
        type: String,
        required: [true, "Le nom (ou raison sociale) est obligatoire"],
        trim: true
    },
    // Spécifique Particulier (ou contact principal société)
    firstname: {
        type: String,
        trim: true
    },

    // 3. Coordonnées (Commun)
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        match: [/\S+@\S+\.\S+/, "Email invalide"]
    },
    phone: { type: String, trim: true },

    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'France' }
    },

    // 4. Infos Légales (Conditionnelles)
    siret: {
        type: String,
        trim: true,
        // VALIDATION CUSTOM : Obligatoire SEULEMENT si c'est une entreprise
        required: function() { return this.type === 'company'; }
    },
    vatNumber: {
        type: String,
        trim: true
        // Pas required car une petite entreprise peut être en franchise de TVA
    },

    isActive: { type: Boolean, default: true }

}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Important pour voir les champs calculés
    toObject: { virtuals: true }
});

// --- VIRTUALS (Champs magiques) ---

// Pour afficher un nom complet propre dans ton interface sans te poser de question
ClientSchema.virtual('displayName').get(function() {
    if (this.type === 'individual') {
        return `${this.firstname} ${this.name}`; // ex: "Jean Dupont"
    }
    return this.name; // ex: "TechCorp SAS"
});

export default mongoose.model('Client', ClientSchema);