import User from '../models/User.js';
import { HTTP_CODE } from '../main.js';
import { log } from '../main.js';
import { generateToken } from './authController.js';

// @desc    Récupérer les infos de l'utilisateur connecté
// @route   GET /api/users/profile (ou l'URL où tu as monté ce routeur)
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        // Grâce au middleware 'protect', req.user contient déjà l'utilisateur
        // Mais par sécurité, on refait un appel propre à la base
        const user = await User.findById(req.user._id).select("+fullname");

        if (user) {
            res.json({
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                fullname: user.fullname,
                email: user.email,
                role: user.role, // Si tu as des rôles (admin, user...)
                createdAt: user.createdAt
            });
        } else {
            res.status(404).json({ message: "Utilisateur introuvable" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        // L'utilisateur est déjà trouvé grâce au middleware 'protect' qui remplit req.user
        const user = await User.findById(req.user._id);

        if (user) {
            // Mise à jour des champs basiques
            user.lastname = req.body.lastname || user.lastname;
            user.firstname = req.body.firstname || user.firstname;
            user.email = req.body.email || user.email;

            // Gestion du mot de passe (Seulement si l'utilisateur a rempli le champ)
            if (req.body.password) {
                user.password = req.body.password; 
                // Le middleware "pre('save')" de ton modèle User se chargera de hacher le mot de passe !
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                token: generateToken(updatedUser._id, updatedUser.role), // On renvoie un nouveau token (optionnel mais propre)
            });
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
