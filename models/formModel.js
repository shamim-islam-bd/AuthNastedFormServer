const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  sector: {
    type: Number,
    required: true,
    },
  checkbox: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const FormModel = mongoose.model('FormModel', formSchema);

module.exports = FormModel;
