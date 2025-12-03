/**
 * Main app for ERP for our society
 * 
 * @author SparkOne, Nainda
 */
// Requirements
const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const app = express();
const winston = require('winston');

// Mongo connection
// mongoose.connect(process.env.MONGO_URI);

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