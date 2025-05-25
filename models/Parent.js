// Parent schema
const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true }
}, { timestamps: true });

const Parent = mongoose.model('Parent', parentSchema);

module.exports = Parent;