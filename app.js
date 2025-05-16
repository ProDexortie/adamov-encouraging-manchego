// Подключение модулей
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const { engine } = require('express-handlebars'); // Обратите внимание на деструктуризацию
const methodOverride = require('method-override');
const moment = require('moment');

// Инициализация приложения
const app = express();

// Подключение к базе данных
mongoose.set('strictQuery', false); // Устраняем предупреждение
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Подключение к MongoDB успешно'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройка шаблонизатора Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  allowProtoMethodsByDefault: true,
  allowProtoPropertiesByDefault: true,
  helpers: {
    formatDate: function(date, format) {
      return moment(date).format(format);
    },
    eq: function(a, b) {
      return a === b;
    },
    json: function(context) {
      return JSON.stringify(context);
    },
    dayOfWeek: function(date) {
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const dayNum = new Date(date).getDay();
      return days[dayNum];
    }
  }
}));

app.set('view engine', 'handlebars');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Connect Flash
app.use(flash());

// Глобальные переменные
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Маршруты
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/tasks', require('./routes/tasks'));
app.use('/goals', require('./routes/goals'));
app.use('/plans', require('./routes/plans'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});