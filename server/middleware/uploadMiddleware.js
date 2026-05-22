const multer = require('multer');
const path = require('path');
const fs = require('fs');
const HttpError = require('../utils/HttpError');

/**
 * Factory function to create multer upload middleware
 * @param {Object} options
 * @param {string} options.uploadDir - destination folder
 * @param {'image'|'document'} options.fileType - type of files allowed
 */
const createUploadMiddleware = ({ uploadDir, fileType }) => {

    // 1. Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Storage config
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

            let prefix = 'file-';
            if (fileType === 'image') prefix = 'img-';
            if (fileType === 'document') prefix = 'doc-';

            cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
        }
    });

    // 3. File filter
    const fileFilter = (req, file, cb) => {
        let allowedTypes;

        if (fileType === 'image') {
            allowedTypes = /jpeg|jpg|png|webp/;
        } else if (fileType === 'document') {
            allowedTypes = /pdf|doc|docx|xls|xlsx/;
        }

        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);

        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new HttpError(`Invalid ${fileType} file type`));
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB
    });
};

module.exports = createUploadMiddleware;