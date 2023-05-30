const multer = require("multer");
const path = require("path");

const upload = multer({
  storage:multer.diskStorage({}),
  limits: { fileSize: 1024*1024 },
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".svg") {
      cb(null, true);

    } else {
      cb(null, false);
      const err = new Error('Only .png, .jpg and .jpeg format allowed!')
      err.name = 'ExtensionError'
      return cb(err); 
    }}}    
);
module.exports = upload;