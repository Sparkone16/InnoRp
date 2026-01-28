import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Protéger les routes (Vérifier si connecté)
export const protect = async (req, res, next) => {
    let token;

    // On vérifie si le header "Authorization" est présent et commence par "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Le format est : "Bearer <TOKEN>". On coupe l'espace pour garder le token.
            token = req.headers.authorization.split(' ')[1];

            // On décode le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // On cherche l'utilisateur associé au token
            // .select('-password') permet de ne pas récupérer le mot de passe hashé
            req.user = await User.findById(decoded.id).select('-password');

            // Si tout est bon, on passe à la suite (le Controller)
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Non autorisé, aucun token fourni' });
    }
};

// 2. Gérer les Rôles (ex: Admin seulement)
export const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user est disponible car 'protect' a tourné juste avant !
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route.` 
            });
        }
        next();
    };
};