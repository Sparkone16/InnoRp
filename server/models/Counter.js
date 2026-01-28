import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // ex: "invoice_2026"
    seq: { type: Number, default: 0 }      // ex: 154
});

export default mongoose.model('Counter', CounterSchema);