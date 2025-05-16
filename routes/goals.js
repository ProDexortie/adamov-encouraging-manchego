const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Goal = require('../models/Goal');

// Получение всех целей
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const goalsDocuments = await Goal.find({ user: req.user.id }).sort({ createdAt: 'desc' });
    // Преобразуем MongoDB документы в обычные объекты
    const goals = goalsDocuments.map(goal => goal.toObject());
    res.render('goals/index', {
      goals
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке целей');
    res.redirect('/dashboard');
  }
});

// Форма добавления цели
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('goals/add');
});

// Добавление цели
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    console.log('POST запрос на создание цели:', req.body);
    
    const { title, description, targetDate, category } = req.body;
    
    // Преобразование подзадач в массив объектов
    let subTasksArray = [];
    
    // Правильная обработка полей с квадратными скобками
    if (req.body['subTasks[]']) {
      const subTasksData = Array.isArray(req.body['subTasks[]']) ? 
        req.body['subTasks[]'] : [req.body['subTasks[]']];
      
      subTasksArray = subTasksData.map(task => {
        if (task && task.trim() !== '') {
          return { title: task, completed: false };
        }
        return null;
      }).filter(task => task !== null);
    }
    
    console.log('Подзадачи для сохранения:', subTasksArray);
    
    const newGoal = new Goal({
      title,
      description,
      targetDate,
      category,
      subTasks: subTasksArray,
      user: req.user.id
    });
    
    await newGoal.save();
    req.flash('success_msg', 'Цель добавлена');
    res.redirect('/goals');
  } catch (err) {
    console.error('Ошибка при создании цели:', err);
    req.flash('error_msg', 'Ошибка при создании цели');
    res.redirect('/goals/add');
  }
});

// Форма редактирования цели
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const goalDocument = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!goalDocument) {
      req.flash('error_msg', 'Цель не найдена');
      return res.redirect('/goals');
    }
    
    const goal = goalDocument.toObject();
    
    res.render('goals/edit', {
      goal
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке цели');
    res.redirect('/goals');
  }
});

// Обновление цели
router.post('/update/:id', ensureAuthenticated, async (req, res) => {
  try {
    console.log('POST запрос на обновление цели:', req.params.id, req.body);
    
    const { title, description, targetDate, status, category, progress } = req.body;
    
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!goal) {
      req.flash('error_msg', 'Цель не найдена');
      return res.redirect('/goals');
    }
    
    // Правильная обработка полей с квадратными скобками
    let subTasksArray = [];
    if (req.body['subTasks[]']) {
      const subTasksData = Array.isArray(req.body['subTasks[]']) ? 
        req.body['subTasks[]'] : [req.body['subTasks[]']];
        
      const completedSubTasksData = req.body['completedSubTasks[]'] ? 
        (Array.isArray(req.body['completedSubTasks[]']) ? 
          req.body['completedSubTasks[]'] : [req.body['completedSubTasks[]']]) : [];
      
      subTasksArray = subTasksData.map((task, index) => {
        if (task && task.trim() !== '') {
          const isCompleted = completedSubTasksData.includes(index.toString());
          return { title: task, completed: isCompleted };
        }
        return null;
      }).filter(task => task !== null);
    }
    
    console.log('Подзадачи для обновления:', subTasksArray);
    
    goal.title = title;
    goal.description = description;
    goal.targetDate = targetDate;
    goal.status = status;
    goal.category = category;
    goal.progress = progress || 0;
    goal.subTasks = subTasksArray;
    
    await goal.save();
    req.flash('success_msg', 'Цель обновлена');
    res.redirect('/goals');
  } catch (err) {
    console.error('Ошибка при обновлении цели:', err);
    req.flash('error_msg', 'Ошибка при обновлении цели');
    res.redirect('/goals');
  }
});

// Удаление цели
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    console.log('POST запрос на удаление цели:', req.params.id);
    
    const goal = await Goal.findOneAndRemove({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!goal) {
      req.flash('error_msg', 'Цель не найдена');
    } else {
      req.flash('success_msg', 'Цель удалена');
    }
    
    res.redirect('/goals');
  } catch (err) {
    console.error('Ошибка при удалении цели:', err);
    req.flash('error_msg', 'Ошибка при удалении цели');
    res.redirect('/goals');
  }
});

// Обновление прогресса цели
router.post('/progress/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { progress } = req.body;
    
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!goal) {
      req.flash('error_msg', 'Цель не найдена');
      return res.redirect('/goals');
    }
    
    goal.progress = progress;
    if (progress >= 100) {
      goal.status = 'Завершена';
    } else if (progress > 0) {
      goal.status = 'В процессе';
    }
    
    await goal.save();
    req.flash('success_msg', 'Прогресс цели обновлен');
    res.redirect('/goals');
  } catch (err) {
    console.error('Ошибка при обновлении прогресса:', err);
    req.flash('error_msg', 'Ошибка при обновлении прогресса');
    res.redirect('/goals');
  }
});

module.exports = router;