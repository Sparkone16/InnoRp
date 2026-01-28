import Client from '../models/Client.js';
import { HTTP_CODE } from '../main.js';
import { log } from '../main.js';

// @desc    Récupérer tous les clients
// @route   GET /api/clients
// @access  Private
export const getAllClients = async (req, res) => {
    try {
        // On récupère tous les clients actifs, triés par date de création (le plus récent en haut)
        const clients = await Client.find({ isActive: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: clients.length,
            data: clients
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des clients." });
    }
};

// @desc    Créer un nouveau client
// @route   POST /api/clients
// @access  Private (Connecté)
export const createClient = async (req, res) => {
    try {
        // 1. On récupère les données du corps de la requête
        // Mongoose fera le tri (type, siret, nom, etc.)
        const clientData = req.body;

        // 2. Vérification de doublon (Email ou Nom)
        // Bien que Mongoose ait 'unique: true', c'est mieux de gérer l'erreur proprement ici
        const clientExists = await Client.findOne({ 
            $or: [{ email: clientData.email }, { name: clientData.name }] 
        });

        if (clientExists) {
            return res.status(400).json({ 
                success: false, 
                message: "Un client avec cet email ou ce nom existe déjà." 
            });
        }

        // 3. Création du client
        const client = await Client.create(clientData);

        // 4. Réponse
        res.status(201).json({
            success: true,
            data: client
        });

    } catch (error) {
        // Gestion des erreurs de validation Mongoose (ex: SIRET manquant pour une entreprise)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la création du client." });
    }
};