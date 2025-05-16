const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Plan = require('../models/Plan');

// Главная страница
router.get('/', (req, res) => {
  res.render('index');
});

// Панель управления
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    // Получаем задачи на сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasksDocuments = await Task.find({
      user: req.user.id,
      dueDate: { $gte: today, $lt: tomorrow }
    }).sort({ priority: -1 });

    // Получаем текущие цели
    const goalsDocuments = await Goal.find({
      user: req.user.id,
      status: { $ne: 'Завершена' }
    }).sort({ targetDate: 1 }).limit(5);

    // Получаем план на сегодня
    const planDocument = await Plan.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Статистика
    const totalTasks = await Task.countDocuments({ user: req.user.id });
    const completedTasks = await Task.countDocuments({ user: req.user.id, status: 'Завершена' });
    const totalGoals = await Goal.countDocuments({ user: req.user.id });
    const completedGoals = await Goal.countDocuments({ user: req.user.id, status: 'Завершена' });

    // Преобразуем MongoDB документы в обычные объекты
    const tasks = tasksDocuments.map(task => task.toObject());
    const goals = goalsDocuments.map(goal => goal.toObject());
    const plan = planDocument ? planDocument.toObject() : null;
    const user = req.user.toObject();

    res.render('dashboard', {
      name: user.name,
      tasks,
      goals,
      plan,
      stats: {
        totalTasks,
        completedTasks,
        taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalGoals,
        completedGoals,
        goalCompletion: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
      }
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', {
      name: req.user.name,
      error: 'Произошла ошибка при загрузке данных'
    });
  }
});

module.exports = router;