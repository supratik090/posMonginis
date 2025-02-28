const mongoose = require("mongoose");

const billSchema = mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
   required: [true, "invoice number/ is required"],
    },
   invoiceDate: {
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
      default: Date.now(),
    },
  },
);

const Bills = mongoose.model("bills", billSchema);

module.exports = Bills;
