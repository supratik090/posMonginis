const mongoose = require("mongoose");
const moment = require("moment-timezone")



const receiptsSchema = mongoose.Schema(
  {
    _id: { type: String, required: true }, // Explicitly tell MongoDB that _id is a String

    returnDate: {
      type: String,
      required: [true],
    },
    invoiceNumber: {
      type: String,
      required: [true, "Customer invoiceNumber is required"],
       unique: true, 
    },
        totalAmount: {
          type: Number,
          required: [true, "Total amount is required"],
        }

  },
);

const receipts = mongoose.model("receipts", receiptsSchema);

module.exports = receipts;
