const express = require('express');
const app = express();
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./utils/supabaseClient');
const multer = require('multer');
const profileRoutes = require('./routes/profile');
const globalVariables = require('./middlewares/globalVariables');
const searchRoutes = require('./routes/search');


const PORT = 3000;

app.use(globalVariables);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(session({
  secret: 'test2343242423',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 3600000,
   }
}));

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/search', searchRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});