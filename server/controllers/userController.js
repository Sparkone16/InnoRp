import User from '../models/User.js';
import { HTTP_CODE } from '../main.js';
import { log } from '../main.js';
import { generateToken } from './authController.js';

// @desc    Récupérer les infos de l'utilisateur connecté
// @route   GET /api/users/profile (ou l'URL où tu as monté ce routeur)
// @access  Private
export const getAllProfiles = async (req, res) => {
    try {
        const users = await User.find({isActive: true});
        if (users) {
            res.json(users);
        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: "Aucun utilisateur" });
        }
    } catch (error) {
        console.error(error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: "Erreur serveur" });
    }
};
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
                phone: user.phone,
                role: user.role, // Si tu as des rôles (admin, user...)
                createdAt: user.createdAt
            });
        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: "Utilisateur introuvable" });
        }
    } catch (error) {
        console.error(error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: "Erreur serveur" });
    }
};

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // 1. Mise à jour des champs basiques
            user.lastname = req.body.lastname || user.lastname;
            user.firstname = req.body.firstname || user.firstname;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.noSecu = req.body.noSecu || user.noSecu;
            user.role = req.body.role || user.role;

            // 2. Gestion du mot de passe
            if (req.body.password) {
                user.password = req.body.password;
            }

            // 3. Gestion de l'ADRESSE (Mise à jour partielle ou totale)
            if (req.body.address) {
                user.address = {
                    street: req.body.address.street || user.address?.street,
                    zipCode: req.body.address.zipCode || user.address?.zipCode,
                    city: req.body.address.city || user.address?.city
                };
            }

            // 4. Gestion du RIB
            if (req.body.rib) {
                user.rib = {
                    bankName: req.body.rib.bankName || user.rib?.bankName,
                    iban: req.body.rib.iban || user.rib?.iban,
                    bic: req.body.rib.bic || user.rib?.bic
                };
            }

            const updatedUser = await user.save();

            res.status(HTTP_CODE.OK).json({
                _id: updatedUser._id,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                // 👇 On renvoie les nouvelles infos pour que l'interface PHP se mette à jour
                address: updatedUser.address,
                rib: updatedUser.rib,
                token: generateToken(updatedUser._id, updatedUser.role),
            });

        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: error.message });
    }
};
// @desc    Récupérer un utilisateur par ID (Admin)
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.status(HTTP_CODE.OK).json(user);
        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: "Utilisateur introuvable" });
        }
    } catch (error) {
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Mettre à jour un utilisateur par ID (Admin)
// @route   PUT /api/users/:id
export const updateUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Infos de base
            user.lastname = req.body.lastname || user.lastname;
            user.firstname = req.body.firstname || user.firstname;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role; // L'admin peut changer le rôle

            // Adresse
            if (req.body.address) {
                user.address = {
                    street: req.body.address.street,
                    zipCode: req.body.address.zipCode,
                    city: req.body.address.city
                };
            }

            // RIB
            if (req.body.rib) {
                user.rib = {
                    bankName: req.body.rib.bankName,
                    iban: req.body.rib.iban,
                    bic: req.body.rib.bic
                };
            }

            const updatedUser = await user.save();
            res.status(HTTP_CODE.OK).json(updatedUser);
        } else {
            res.status(HTTP_CODE.NOT_FOUND).json({ message: "Utilisateur introuvable" });
        }
    } catch (error) {
        res.status(HTTP_CODE.SERVER_ERROR).json({ message: error.message });
    }
};
