const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middlewares/authMiddleware');
const UserProfile = require('../models/userProfile');
const { profileUpload, postUpload } = require('../utils/multerConfig');
const supabase = require('../utils/supabaseClient');
const fs = require('fs');
const path = require('path');

router.get('/:username', protectRoute, async (req, res) => {
    const { username } = req.params;
  
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
  
      if (profileError || !profileData) {
        console.log('User profile not found');
        return res.status(404).send('User profile not found');
      }
  
      const userProfile = await UserProfile.findOne({ userId: profileData.id });
  
      if (!userProfile) {
        console.log('User profile not found');
        return res.status(404).send('User profile not found');
      }
  
      const isOwner = req.user && req.user.username === username;
  
      res.render('profile', {
        user: req.user,
        profile: userProfile,
        isLoggedIn: req.isLoggedIn,
        isOwner,
        activeMenu: 'profile',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).send('Error fetching user profile');
    }
  });

router.post('/uploadProfilePicture', protectRoute, profileUpload, async (req, res) => {
  if (!req.file) {
    console.log('No file was uploaded');
    return res.render('profile', {
      msg: 'No file selected!',
      user: req.user,
      isLoggedIn: req.isLoggedIn,
      activeMenu: 'profile',
      profilePicture: req.user.profile.profilePicture || '/uploads/default.png',
    });
  }

  console.log('File uploaded successfully:', req.file.filename);

  const profilePictureUrl = `/uploads/profile_pictures/${req.file.filename}`;

  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { profilePicture: profilePictureUrl } },
      { new: true, upsert: false }
    );

    console.log('Profile picture updated successfully');

    req.user.profile = updatedProfile;

    res.redirect(`/profile/${req.user.username}`);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.render('profile', {
      msg: 'Error updating profile picture!',
      user: req.user,
      isLoggedIn: req.isLoggedIn,
      activeMenu: 'profile',
      profilePicture: req.user.profile.profilePicture || '/uploads/default.png',
    });
  }
});

router.post('/uploadImagePost', protectRoute, postUpload, async (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.log('No files were uploaded');
    return res.render('profile', {
      msg: 'No files selected!',
      user: req.user,
      isLoggedIn: req.isLoggedIn,
      activeMenu: 'profile',
      postImages: req.user.profile.postImages || [],
    });
  }

  const imagePostUrls = req.files.map(file => `/uploads/image_post/${file.filename}`);

  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { postImages: { $each: imagePostUrls } } },
      { new: true, upsert: false }
    );

    req.user.profile = updatedProfile;

    res.redirect(`/profile/${req.user.username}`);
  } catch (error) {
    console.error('Error updating profile posts:', error);
    return res.render('profile', {
      msg: 'Error updating profile posts!',
      user: req.user,
      isLoggedIn: req.isLoggedIn,
      activeMenu: 'profile',
      postImages: req.user.profile.postImages || [],
    });
  }
});

router.post('/updateBio', protectRoute, async (req, res) => {
  const { bio } = req.body;

  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { bio: bio },
      { new: true, upsert: true }
    );

    req.user.profile.bio = bio;

    res.redirect(`/profile/${req.user.username}`);
  } catch (error) {
    console.error('Error updating bio:', error);
    return res.render('profile', {
      msg: 'Error updating bio!',
      user: req.user,
      isLoggedIn: req.isLoggedIn,
      activeMenu: 'profile',
    });
  }
});

router.post('/deleteImage', protectRoute, async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ success: false, message: 'Image URL is required' });
  }

  const imagePath = path.join(__dirname, '..', imageUrl);

  try {
    fs.unlink(imagePath, async (err) => {
      if (err) {
        console.error('Error deleting image file:', err);
        return res.status(500).json({ success: false, message: 'Error deleting image file' });
      }

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { postImages: imageUrl } },
        { new: true }
      );

      console.log('Image deleted successfully');

      req.user.profile = updatedProfile;

      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});

module.exports = router;