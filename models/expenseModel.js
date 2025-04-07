const mongoose = require('mongoose');
const moment = require('moment-timezone');

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  expenseType: { type: String, enum: ['Cash', 'Online', 'Other'], default: 'Cash' },
  userName: { type: String, required: true },
  notes: { type: String, required: false },
    date: {
      type: Date,
      default: () => moment().tz("Asia/Kolkata").toDate(),
    },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
