const supabase = require('../utils/supabaseClient');
const UserProfile = require('../models/userProfile');

const protectRoute = async (req, res, next) => {
  const token = req.cookies['supabase-auth-token'];

  if (!token) {
    req.isLoggedIn = false;
    return next();
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    req.isLoggedIn = false;
    return next();
  }

  let userProfile = await UserProfile.findOne({ userId: authData.user.id });

  if (!userProfile) {
    userProfile = new UserProfile({
      userId: authData.user.id,
    });
    await userProfile.save();
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching username:', profileError);
    req.isLoggedIn = false;
    return next();
  }

  req.user = {
    ...authData.user,
    username: profileData.username,
    profile: userProfile,
  };

  req.isLoggedIn = true;
  next();
};

module.exports = { protectRoute };