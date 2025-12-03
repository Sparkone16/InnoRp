const mongoose = require('mongoose');

// List all schemas
const clientSchema = new Schema({
    nom: String,
    mail: String,
    tel: String,
    address: String
});