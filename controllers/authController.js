const supabase = require('../utils/supabaseClient');

exports.googleLogin = async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.redirect(data.url);
};