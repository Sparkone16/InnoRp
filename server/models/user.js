import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import winston from 'winston';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
    // 1. Identité & Login
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, "L'email est invalide"] // Validation Regex simple
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire"],
        minlength: 8,
        select: false // SUPER IMPORTANT : Le mot de passe ne sera pas renvoyé par défaut lors des requêtes (sécurité)
    },

    // 2. Profil Utilisateur
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    avatarUrl: {
        type: String,
        default: null
    },

    // 3. Gestion des Accès (RBAC)
    role: {
        type: String,
        enum: ['admin', 'gestion', 'comptable', 'employe'],
        default: 'employe'
    },
    isActive: {
        type: Boolean,
        default: true // Par défaut, un utilisateur créé est actif
    },

    // 4. Champs techniques & Mobile
    lastLoginAt: {
        type: Date,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // 5. Soft Delete (Ne jamais supprimer physiquement)
    deletedAt: {
        type: Date,
        default: null
    }

}, {
    // Options du schéma
    timestamps: true, // Ajoute automatiquement 'createdAt' et 'updatedAt'
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- VIRTUALS ---
// Champ calculé qui n'est pas stocké en base, mais généré à la volée
UserSchema.virtual('fullName').get(function() {
    return `${this.firstname} ${this.lastname}`;
});

// --- MIDDLEWARES (HOOKS) ---

// 1. Hachage du mot de passe avant la sauvegarde
UserSchema.pre('save', async function(next) {
    // Si le mot de passe n'a pas été modifié, on passe (évite de le rehacher)
    if (!this.isModified('password')) {
        return next();
    }

    // Génération du sel et hachage
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);