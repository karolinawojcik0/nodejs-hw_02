const multer = require('multer');
const path = require('path');

const tmpDir = path.join(__dirname, '../tmp');

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const limits = {
  fileSize: 1024 * 1024 * 2
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
