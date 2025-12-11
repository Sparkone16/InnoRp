import { generateNodeToken } from './import.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import winston from 'winston';
import crypto from 'crypto';

const profilesSchema = new mongoose.Schema({
    token: String,
    lastConnection: Date,
});
const profilesModel = mongoose.model('profilesModel', profilesSchema);

export const API_REGISTER = function (req, res) {
    if (req.headers.authorization === ("Bearer " + process.env.REGISTER_TOKEN)) {
        let result = profilesModel.findById(req.query.CLIENT_ID);
        if (result) {
            result.lastConnection = new Date();
            res.writeHead(HTTP_CODE.OK, {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
            });
            res.json({
                USER_TOKEN: result.token
            });
        } else {
            let newUser = profilesModel.create({
                token: generateNodeToken, 
                lastConnection: new Date()
            });
            newUser.save();
        }
    } else {
        res.writeHead(HTTP_CODE.UNAUTHORIZED, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
        });
        res.send('Invalid token');
    }
}