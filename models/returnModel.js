const mongoose = require("mongoose");
const moment = require("moment-timezone")



const returnSchema = mongoose.Schema(
  {
    _id: { type: String, required: true }, // Explicitly tell MongoDB that _id is a String

    returnDate: {
      type: String,
      required: [false],
    },
    creditNote: {
      type: String,
      required: [false, "Customer number is required"],
    },

        deductedAmount: {
          type: Number,
          required: [true, "Total amount is required"],
        },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    returnItems: {
      type: Array,
      required: [true, "Cart items are required"],
    },
    date: {
      type: Date,
      default: () => moment().tz("Asia/Kolkata").toDate(),
    },

  },
);

const returns = mongoose.model("returns", returnSchema);

module.exports = returns;
