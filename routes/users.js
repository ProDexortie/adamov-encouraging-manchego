const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth'); // Добавляем импорт middleware

// Модель пользователя
const User = require('../models/User');

// Страница входа
router.get('/login', (req, res) => {
  res.render('login');
});

// Страница регистрации
router.get('/register', (req, res) => {
  res.render('register');
});

// Страница профиля
router.get('/profile', ensureAuthenticated, (req, res) => {
  // Преобразуем объект пользователя в обычный объект
  const user = req.user.toObject();
  res.render('profile', {
    user
  });
});

// Обработка регистрации
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Проверка полей
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Пожалуйста, заполните все поля' });
  }

  // Проверка соответствия паролей
  if (password !== password2) {
    errors.push({ msg: 'Пароли не совпадают' });
  }

  // Проверка длины пароля
  if (password.length < 6) {
    errors.push({ msg: 'Пароль должен быть не менее 6 символов' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Проверка существования пользователя
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          errors.push({ msg: 'Email уже зарегистрирован' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });

          // Хеширование пароля
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'Вы успешно зарегистрировались и можете войти');
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
  }
});

// Обработка входа
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Выход
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.flash('success_msg', 'Вы вышли из системы');
    res.redirect('/users/login');
  });
});

module.exports = router;