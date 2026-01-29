import Client from '../models/Client.js';
import { HTTP_CODE } from '../main.js';
import { log } from '../main.js';

/**
 * @desc    Récupérer tous les clients
 * @route   GET /api/clients
 * @access  Private
 */
export const getAllClients = async (req, res) => {
    try {
        // On récupère tous les clients actifs, triés par date de création (le plus récent en haut)
        const clients = await Client.find({ isActive: true }).sort({ createdAt: -1 });

        res.status(HTTP_CODE.OK).json({
            success: true,
            count: clients.length,
            data: clients
        });

    } catch (error) {
        console.error(error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ success: false, message: "Erreur lors de la récupération des clients." });
    }
};
/**
 * @desc    Récupérer un seul client par son ID
 * @route   GET /api/clients/:id
 * @access  Private
*/
export const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(HTTP_CODE.NOT_FOUND).json({ success: false, message: "Client introuvable." });
        }

        res.status(HTTP_CODE.OK).json({
            success: true,
            data: client
        });
    } catch (error) {
        console.error(error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ success: false, message: "Erreur serveur (ID invalide ?)." });
    }
};
/**
 * @desc    Créer un nouveau client
 * @route   POST /api/clients
 * @access  Private (Connecté)
 */
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
            return res.status(HTTP_CODE.CONFLICT).json({ 
                success: false, 
                message: "Un client avec cet email ou ce nom existe déjà." 
            });
        }

        // 3. Création du client
        const client = await Client.create(clientData);

        // 4. Réponse
        res.status(HTTP_CODE.CREATED).json({
            success: true,
            data: client
        });

    } catch (error) {
        // Gestion des erreurs de validation Mongoose (ex: SIRET manquant pour une entreprise)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(HTTP_CODE.BAD_REQUEST).json({ success: false, message: messages.join(', ') });
        }
        
        console.error(error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ success: false, message: "Erreur serveur lors de la création du client." });
    }
};

/**
 * @desc    Supprimer un client
 * @route   DELETE /api/clients/:id
 * @access  Private (Connecté)
 */
export const deleteClient = async (req, res) => {
    try {
        console.log("Tentative de suppression pour ID:", req.params.id);

        // On utilise findByIdAndUpdate qui est plus direct et robuste
        const client = await Client.findByIdAndUpdate(
            req.params.id, 
            { isActive: false }, // On force la valeur
            { new: true }        // On demande à récupérer l'objet modifié
        );

        if (!client) {
            console.log("Client introuvable !");
            return res.status(HTTP_CODE.NOT_FOUND).json({ success: false, message: "Client introuvable." });
        }

        console.log("Nouvel état du client:", client.isActive); // Doit afficher false

        res.status(HTTP_CODE.OK).json({ 
            success: true, 
            message: "Client désactivé avec succès." 
        });

    } catch (error) {
        console.error("Erreur DELETE:", error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ success: false, message: "Erreur serveur." });
    }
};

/**
 * @desc    Mettre à jour un client
 * @route   PUT /api/clients/:id
 * @access  Private (Connecté)
 */
export const updateClient = async (req, res) => {
    try {
        console.log("----- DEBUG UPDATE -----");
        console.log("ID reçu :", req.params.id);
        console.log("Données reçues (Body) :", req.body);
        // req.params.id contient l'ID dans l'URL
        // req.body contient les nouvelles données

        // findByIdAndUpdate(id, data, options)
        // { new: true } -> renvoie le client modifié (et pas l'ancien)
        // { runValidators: true } -> vérifie que l'email est toujours valide, etc.
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!client) {
            return res.status(HTTP_CODE.NOT_FOUND).json({ success: false, message: "Client introuvable." });
        }

        res.status(HTTP_CODE.OK).json({
            success: true,
            message: "Client mis à jour avec succès.",
            data: client
        });

    } catch (error) {
        console.error(error);
        // Gestion des doublons (si on modifie l'email vers un qui existe déjà)
        if (error.code === 11000) { 
            return res.status(HTTP_CODE.BAD_REQUEST).json({ success: false, message: "Cet email ou ce nom existe déjà." });
        }
        res.status(HTTP_CODE.SERVER_ERROR).json({ success: false, message: "Erreur lors de la mise à jour." });
    }
};