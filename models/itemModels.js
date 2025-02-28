const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
  },
  quantity: {
      type: Number,
      required: [false, 'Quantity is required.'],
    },
  category: {
    type: String,
    required: [false, 'Category is required.'],
  },
  image: {
    type: String,
    required: [false, 'Image is optional.'],
  },
  code: {
      type: String,
      required: [true, 'Code is optional.'],
    },
    shelfLife: {
      type: Number,
      default: 60,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}
,{ timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
