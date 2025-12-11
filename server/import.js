import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import winston from 'winston';
import crypto from 'crypto';


export function generateNodeToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}