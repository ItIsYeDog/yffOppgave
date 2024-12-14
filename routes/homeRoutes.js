const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middlewares/authMiddleware');

router.get('/', protectRoute, (req, res) => {
  res.render('home', { user: req.user, isLoggedIn: req.isLoggedIn, activeMenu: 'home' });
});

router.get('/search', protectRoute, (req, res) => {
  res.render('search', { user: req.user, isLoggedIn: req.isLoggedIn, activeMenu: 'search' });
});

module.exports = router;