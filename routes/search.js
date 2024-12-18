const express = require('express');
const router = express.Router();
const UserProfile = require('../models/userProfile');
const supabase = require('../utils/supabaseClient');
const { protectRoute } = require('../middlewares/authMiddleware');

router.get('/', protectRoute, async (req, res) => {
  const query = req.query.q || '';

  try {
    const { data: supabaseUsers, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${query}%`);

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return res.status(500).send('Error fetching users');
    }

    if (supabaseUsers.length === 0) {
      return res.render('search', {
        user: req.user,
        isLoggedIn: req.isLoggedIn,
        activeMenu: 'search',
        query,
        users: [],
      });
    }

    const userIds = supabaseUsers.map(user => user.id);

    const mongoProfiles = await UserProfile.find({ userId: { $in: userIds } })
      .select('userId bio profilePicture');

    const profileMap = mongoProfiles.reduce((map, profile) => {
      map[profile.userId] = profile;
      return map;
    }, {});

    const users = supabaseUsers.map(user => {
      const profile = profileMap[user.id] || {};
      return {
        username: user.username,
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || '/uploads/default.png',
      };
    });

    res.render('search', {
      user: req.user,
      isLoggedIn: req.isLoggedIn,
      activeMenu: 'search',
      query,
      users,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Error processing search');
  }
});

module.exports = router;