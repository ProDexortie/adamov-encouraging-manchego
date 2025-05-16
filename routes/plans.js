const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Plan = require('../models/Plan');

// Получение всех планов
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const plansDocuments = await Plan.find({ user: req.user.id }).sort({ date: 'desc' });
    // Преобразуем MongoDB документы в обычные объекты
    const plans = plansDocuments.map(plan => plan.toObject());
    res.render('plans/index', {
      plans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке планов');
    res.redirect('/dashboard');
  }
});

// Получение планов по дате
router.get('/date/:date', ensureAuthenticated, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const plans = await Plan.find({ 
      user: req.user.id,
      date: { $gte: date, $lt: nextDay }
    });
    
    res.render('plans/index', {
      plans
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке планов');
    res.redirect('/plans');
  }
});

// Форма добавления плана
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('plans/add');
});

// Добавление плана
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    console.log('POST запрос на создание плана:', req.body);
    
    const { date, notes } = req.body;
    
    // Правильная обработка полей с квадратными скобками
    let planItems = [];
    if (req.body['items[]']) {
      const itemsData = Array.isArray(req.body['items[]']) ? 
        req.body['items[]'] : [req.body['items[]']];
        
      const timesData = req.body['times[]'] ? 
        (Array.isArray(req.body['times[]']) ? 
          req.body['times[]'] : [req.body['times[]']]) : [];
      
      planItems = itemsData.map((item, index) => {
        if (item && item.trim() !== '') {
          return {
            title: item,
            completed: false,
            time: index < timesData.length ? timesData[index] : ''
          };
        }
        return null;
      }).filter(item => item !== null);
    }
    
    console.log('Пункты плана для сохранения:', planItems);
    
    // Проверка существования плана на эту дату
    const existingPlan = await Plan.findOne({
      user: req.user.id,
      date: new Date(date)
    });
    
    if (existingPlan) {
      existingPlan.notes = notes;
      existingPlan.items = [...existingPlan.items, ...planItems];
      await existingPlan.save();
      req.flash('success_msg', 'План обновлен');
    } else {
      const newPlan = new Plan({
        date,
        notes,
        items: planItems,
        user: req.user.id
      });
      
      await newPlan.save();
      req.flash('success_msg', 'План добавлен');
    }
    
    res.redirect('/plans');
  } catch (err) {
    console.error('Ошибка при создании плана:', err);
    req.flash('error_msg', 'Ошибка при создании плана');
    res.redirect('/plans/add');
  }
});

// Форма редактирования плана
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const planDocument = await Plan.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!planDocument) {
      req.flash('error_msg', 'План не найден');
      return res.redirect('/plans');
    }
    
    const plan = planDocument.toObject();
    
    res.render('plans/edit', {
      plan
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при загрузке плана');
    res.redirect('/plans');
  }
});

// Обновление плана
router.post('/update/:id', ensureAuthenticated, async (req, res) => {
  try {
    console.log('POST запрос на обновление плана:', req.params.id, req.body);
    
    const { date, notes } = req.body;
    
    const plan = await Plan.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!plan) {
      req.flash('error_msg', 'План не найден');
      return res.redirect('/plans');
    }
    
    // Правильная обработка полей с квадратными скобками
    let planItems = [];
    if (req.body['items[]']) {
      const itemsData = Array.isArray(req.body['items[]']) ? 
        req.body['items[]'] : [req.body['items[]']];
        
      const timesData = req.body['times[]'] ? 
        (Array.isArray(req.body['times[]']) ? 
          req.body['times[]'] : [req.body['times[]']]) : [];
          
      const completedData = req.body['completed[]'] ? 
        (Array.isArray(req.body['completed[]']) ? 
          req.body['completed[]'] : [req.body['completed[]']]) : [];
      
      planItems = itemsData.map((item, index) => {
        if (item && item.trim() !== '') {
          return {
            title: item,
            completed: completedData.includes(index.toString()),
            time: index < timesData.length ? timesData[index] : ''
          };
        }
        return null;
      }).filter(item => item !== null);
    }
    
    console.log('Пункты плана для обновления:', planItems);
    
    plan.date = date;
    plan.notes = notes;
    plan.items = planItems;
    
    await plan.save();
    req.flash('success_msg', 'План обновлен');
    res.redirect('/plans');
  } catch (err) {
    console.error('Ошибка при обновлении плана:', err);
    req.flash('error_msg', 'Ошибка при обновлении плана');
    res.redirect('/plans');
  }
});

// Удаление плана
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const plan = await Plan.findOneAndRemove({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!plan) {
      req.flash('error_msg', 'План не найден');
    } else {
      req.flash('success_msg', 'План удален');
    }
    
    res.redirect('/plans');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при удалении плана');
    res.redirect('/plans');
  }
});

// Обновление статуса пункта плана
router.post('/item/:id/:itemIndex', ensureAuthenticated, async (req, res) => {
  try {
    const { completed } = req.body;
    
    const plan = await Plan.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!plan) {
      req.flash('error_msg', 'План не найден');
      return res.redirect('/plans');
    }
    
    const itemIndex = parseInt(req.params.itemIndex);
    if (plan.items[itemIndex]) {
      plan.items[itemIndex].completed = completed === 'true';
      await plan.save();
      req.flash('success_msg', 'Статус пункта плана обновлен');
    } else {
      req.flash('error_msg', 'Пункт плана не найден');
    }
    
    res.redirect('/plans');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ошибка при обновлении статуса');
    res.redirect('/plans');
  }
});

module.exports = router;