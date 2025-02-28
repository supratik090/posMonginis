const mongoose = require('mongoose');

const getDefaultReturnDate = () => {
    const now = new Date();
    now.setDate(now.getDate() + 2);
    return now;
};



const inventorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Name is required.'],
  },
     invoiceNumber: {
        type: String,
        required: [false, 'Invoice is required.'],
      },
   invoiceDate: {
      type: String,
      required: [false, 'Invoice is required.'],
    },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
  },
  quantity: {
      type: Number,
      required: [true, 'Quantity is required.'],
    },
    returnDate: {
    type: Date,
    default: getDefaultReturnDate ,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}
,{ timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
