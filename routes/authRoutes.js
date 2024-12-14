const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { protectRoute } = require('../middlewares/authMiddleware');
const UserProfile = require('../models/userProfile');

router.get('/register', protectRoute, (req, res) => {
  res.render('auth/register', { isLoggedIn: req.isLoggedIn, activeMenu: 'register' });
});

router.get('/login', protectRoute, (req, res) => {
  res.render('auth/login', { isLoggedIn: req.isLoggedIn, activeMenu: 'login' });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error during logout');
    }
    res.redirect('/auth/login');
  });
});


router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  const { data: existingUser, error: usernameError } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (usernameError && usernameError.code !== 'PGRST116') {
    console.error('Error checking username:', usernameError);
    return res.status(500).send('Error checking username');
  }

  if (existingUser) {
    return res.status(400).send('Username already exists');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).send(error.message);

  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: data.user.id, username }]);

  if (profileError) {
    console.error('Error saving profile:', profileError);
    return res.status(500).send('Error saving profile');
  }

  const newUserProfile = new UserProfile({
    userId: data.user.id,
    bio: '',
    profilePicture: '/uploads/default.png',
  });

  try {
    await newUserProfile.save();
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).send('Error creating user profile');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log('Login error:', error.message);
    return res.status(400).send(error.message);
  }

  req.session.user = data.user;
  res.cookie('supabase-auth-token', data.session.access_token, { httpOnly: true });

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching username:', profileError);
    return res.status(500).send('Error fetching username');
  }

  req.session.user.username = profileData.username;

  res.redirect(`/profile/${profileData.username}`);
});

router.get('/login/google', async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback'
    }
  });

  if (error) {
    return res.status(400).send(error.message);
  }

  res.redirect(data.url); 
});

router.get('/callback', async (req, res) => {
  const { access_token, refresh_token } = req.query;

  if (!access_token || !refresh_token) {
    console.log('Missing tokens');
    return res.status(400).send('Missing access or refresh token');
  }

  console.log('Received access_token:', access_token);
  console.log('Received refresh_token:', refresh_token);

  try {
    const { user, error } = await supabase.auth.api.getUser(access_token);

    if (error) {
      console.log('Supabase authentication failed:', error.message);
      return res.status(400).send('Authentication failed: ' + error.message);
    }

    console.log('User fetched from Supabase:', user);

    req.session.user = user;
    req.session.refresh_token = refresh_token;
    res.cookie('supabase-auth-token', access_token, { httpOnly: true });

    res.redirect('/auth/profile');
  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;