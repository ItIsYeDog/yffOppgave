const multer = require('multer');
const path = require('path');

// Profile Picture Storage Configuration
const profileStorage = multer.diskStorage({
  destination: './uploads/profile_pictures',
  filename: function (req, file, cb) {
    cb(null, 'profilePicture-' + Date.now() + path.extname(file.originalname));
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('profilePicture');

// Image Post Storage Configuration
const postStorage = multer.diskStorage({
  destination: './uploads/image_post',
  filename: function (req, file, cb) {
    cb(null, 'imagePost-' + Date.now() + path.extname(file.originalname));
  },
});

const postUpload = multer({
  storage: postStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array('imagePost', 10); // Allow up to 10 files

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}

module.exports = {
  profileUpload,
  postUpload,
};