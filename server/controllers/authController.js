const User = require('../models/User'); // Ton modèle Mongoose précédent
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour générer le Token
const generateToken = (id, role) => {
    // Le token contient l'ID et le Rôle.
    // Il expire dans 30 jours (adapter selon le besoin de sécurité vs confort)
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation basique
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Veuillez fournir un email et un mot de passe." 
            });
        }

        // 2. Recherche de l'utilisateur
        // IMPORTANT : On doit ajouter .select('+password') car par défaut 
        // le champ password est caché dans le Modèle (select: false)
        const user = await User.findOne({ email }).select('+password');

        // 3. Vérification si l'utilisateur existe
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Email ou mot de passe incorrect." 
            });
        }

        // 4. Vérification du mot de passe (Méthode définie dans le modèle User)
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Email ou mot de passe incorrect." 
            });
        }

        // 5. Vérification du statut (Est-il banni ou désactivé ?)
        if (user.isActive === false) {
             return res.status(403).json({ 
                success: false, 
                message: "Votre compte a été désactivé. Contactez l'admin." 
            });
        }

        // 6. Succès : Génération du Token
        const token = generateToken(user._id, user.role);

        // Mettre à jour la date de dernière connexion sans bloquer la réponse
        user.lastLoginAt = Date.now();
        await user.save({ validateBeforeSave: false }); 

        // 7. Envoi de la réponse au client (Mobile/Web/Desktop)
        res.status(HTTP_CODE.OK).json({
            success: true,
            token: token, // Le précieux sésame à stocker côté client
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                avatar: user.avatarUrl
            }
        });

    } catch (error) {
        log.error(error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ 
            success: false, 
            message: "Erreur serveur lors de la connexion." 
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;

        // 1. Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(HTTP_CODE.CONFLICT).json({ success: false, message: "Cet email est déjà utilisé." });
        }

        // 2. Créer l'utilisateur
        // Pas besoin de hasher le mot de passe ici, le middleware 'pre save' 
        // dans ton modèle User.js le fera automatiquement !
        const user = await User.create({
            firstname,
            lastname,
            email,
            password,
            role // Attention : Assure-toi de sécuriser qui a le droit de définir le rôle
        });

        // 3. Générer le token tout de suite (pour qu'il soit connecté direct)
        const token = generateToken(user._id, user.role); 

        res.status(HTTP_CODE.CREATED).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstname: user.firstname,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(HTTP_CODE.SERVER_ERROR).json({ success: false, message: "Erreur lors de l'inscription." });
    }
};