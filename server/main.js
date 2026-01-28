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
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

// Mongo connection
const {
  MONGO_NAME,
  MONGO_PASS,
  MONGO_HOST,
  MONGO_PORT
} = process.env;

const HTTP_CODE = {
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

// On construit l'URI dynamiquement
const auth = MONGO_PASS ? `${MONGO_NAME}:${MONGO_PASS}` : MONGO_NAME;
const mongoURI = `mongodb://${auth}@${MONGO_HOST}:${MONGO_PORT}/admin?authSource=admin`;

const connectWithRetry = () => {
  log.info("Tentative de connexion à MongoDB...");
  mongoose.connect(mongoURI)
    .then(() => log.info("✅ Connexion à MongoDB réussie !"))
    .catch(err => {
      log.error("❌ Échec connexion MongoDB. Nouvel essai dans 5s...", err.message);
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();


// Uses to express app
app.listen(process.env.API_PORT, () => {
  log.info(process.env.APP_NAME + " : Server start on port " + process.env.API_PORT);
});

app.get('/', (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);