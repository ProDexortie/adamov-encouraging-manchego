const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  targetDate: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Новая', 'В процессе', 'Завершена'],
    default: 'Новая'
  },
  category: {
    type: String,
    default: 'Общее'
  },
  subTasks: [{
    title: String,
    completed: {
      type: Boolean,
      default: false
    }
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

const Goal = mongoose.model('Goal', GoalSchema);

module.exports = Goal;