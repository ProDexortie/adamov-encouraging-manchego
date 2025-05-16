const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Task = require('../models/Task');

// Получение всех задач
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const tasksDocuments = await Task.find({ user: req.user.id }).sort({ createdAt: 'desc' });
    // Преобразуем MongoDB документы в обычные объекты
    const tasks = tasksDocuments.map(task => task.toObject());
    res.render('tasks/index', {
      tasks
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке задач');
    res.redirect('/dashboard');
  }
});

// Форма добавления задачи
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('tasks/add');
});

// Добавление задачи
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, tags } = req.body;
    
    // Преобразование строки тегов в массив
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      category,
      tags: tagArray,
      user: req.user.id
    });
    
    await newTask.save();
    req.flash('success_msg', 'Задача добавлена');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при создании задачи');
    res.redirect('/tasks/add');
  }
});

// Форма редактирования задачи
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const taskDocument = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!taskDocument) {
      req.flash('error_msg', 'Задача не найдена');
      return res.redirect('/tasks');
    }
    
    const task = taskDocument.toObject();
    
    res.render('tasks/edit', {
      task
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке задачи');
    res.redirect('/tasks');
  }
});

// Обновление задачи
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, category, tags } = req.body;
    
    // Преобразование строки тегов в массив
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      req.flash('error_msg', 'Задача не найдена');
      return res.redirect('/tasks');
    }
    
    task.title = title;
    task.description = description;
    task.dueDate = dueDate || null;
    task.priority = priority;
    task.status = status;
    task.category = category;
    task.tags = tagArray;
    
    await task.save();
    req.flash('success_msg', 'Задача обновлена');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при обновлении задачи');
    res.redirect('/tasks');
  }
});

// Удаление задачи
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOneAndRemove({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      req.flash('error_msg', 'Задача не найдена');
    } else {
      req.flash('success_msg', 'Задача удалена');
    }
    
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при удалении задачи');
    res.redirect('/tasks');
  }
});

// Быстрое изменение статуса задачи
router.post('/status/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      req.flash('error_msg', 'Задача не найдена');
      return res.redirect('/tasks');
    }
    
    task.status = status;
    await task.save();
    
    req.flash('success_msg', 'Статус задачи обновлен');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при обновлении статуса');
    res.redirect('/tasks');
  }
});

module.exports = router;