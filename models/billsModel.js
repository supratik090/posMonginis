const mongoose = require("mongoose");
const moment = require("moment-timezone")



const billSchema = mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [false, "Customer name is required"],
    },
    customerNumber: {
      type: String,
      required: [false, "Customer number is required"],
    },
    subTotal:{
      type: Number,
      required: [true, "SubTotal amount is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },

    adjustment: {
      type: Number,
      required: [false, ""],
    },
    notes: {
      type: String,
      required: [false, ""],
    },
    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
    },
    cashier: {
          type: String,
          required: [true, "Cashier name is required"],
        },
    cartItems: {
      type: Array,
      required: [true, "Cart items are required"],
    },
    date: {
      type: Date,
      default: () => moment().tz("Asia/Kolkata").toDate(),
    },

  },
);

const Bills = mongoose.model("bills", billSchema);

module.exports = Bills;
