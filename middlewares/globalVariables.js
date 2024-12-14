const globalVariables = (req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.isLoggedIn = req.isLoggedIn || false;
    res.locals.activeMenu = req.activeMenu || '';
    next();
  };
  
  module.exports = globalVariables;