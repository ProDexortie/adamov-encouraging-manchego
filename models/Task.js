const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['Низкий', 'Средний', 'Высокий'],
    default: 'Средний'
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
  tags: {
    type: [String]
  },
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

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;