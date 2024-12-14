const mongoose = require('../utils/mongoClient');

const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '/uploads/default.png' },
  postImages: { type: [String], default: [] },
});

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

module.exports = UserProfile;