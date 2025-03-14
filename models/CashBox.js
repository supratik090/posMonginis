const mongoose = require('mongoose');
const moment = require('moment-timezone');

const cashBoxSchema = new mongoose.Schema({
  rs500: { type: Number, required: false },
  rs200: { type: Number, required: false },
  rs100: { type: Number, required: false },
  rs50: { type: Number, required: false },
  total: { type: Number, required: true },
  userName: { type: String, required: true },
  notes: { type: String, required: false },
  isStartOfDay: { type: Boolean, default: false},
  time: { type: String, default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
}, { timestamps: true });

module.exports = mongoose.model('CashBox', cashBoxSchema);