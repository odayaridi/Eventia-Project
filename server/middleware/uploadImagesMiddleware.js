// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const HttpError = require('../utils/HttpError');

// // Folder for event images
// const uploadDir = 'public/uploads/eventsImages';

// // Create folder if it doesn't exist
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Storage config
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// // Optional: filter only images
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|webp/;
//     const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mime = allowedTypes.test(file.mimetype);

//     if (ext && mime) {
//         cb(null, true);
//     } else {
//         cb(new HttpError('Only image files are allowed (jpeg, jpg, png, webp)'));
//     }
// };

// const uploadImages = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 } // 5MB
// });

// module.exports = uploadImages;