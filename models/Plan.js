const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  items: [{
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    time: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;