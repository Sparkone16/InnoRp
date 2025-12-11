/**
 * Main app for ERP for our society
 * 
 * @author SparkOne, Nainda
 */
// Requirements
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import winston from 'winston';
import crypto from 'crypto';

import {API_REGISTER} from './profiles.js';
import {generateNodeToken} from './import.js';
// Mongo connection
mongoose.connect(process.env.MONGO_URI);

let HTTP_CODE = {
    OK: 200,
    CREATED: 201,
    SEE_OTHER: 303,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    METHOD_NOT_ALLOWED: 405,
    SERVER_ERROR: 500,
}
// Create the Logger configuration
const log = winston.createLogger({
  level: process.env.LOGGER_STATE,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple() // or winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Log to the console/terminal
    new winston.transports.File({ filename: 'var/server.log' }) // Optional: Log to a file
  ],
});

// Uses to express app
app.listen(process.env.API_PORT, () => {
    log.info(process.env.APP_NAME + " : Server start on port " + process.env.API_PORT);
});

app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello World" });
});

app.get('/api/register', API_REGISTER);