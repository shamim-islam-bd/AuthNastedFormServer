const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sector: [
   {
    name: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    subOptions: [
        {
            name: {
                type: String,
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
        }
    ]
   }],

  checkbox: {
    type: Boolean,
    required: false,
  },
});

const DataModel = mongoose.model('DataModel', formSchema);

module.exports = DataModel;

