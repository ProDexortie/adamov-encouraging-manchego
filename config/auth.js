module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Пожалуйста, войдите в систему для доступа к этой странице');
    res.redirect('/users/login');
  }
};