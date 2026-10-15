import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/uploads is git-ignored, so it does not exist on a fresh checkout or
// Docker image; multer does not create it and every upload would fail.
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow both images and PDF files for routine uploads
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check both file extension and mimetype
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf'
  ];
  
  const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
  
  if (mimetypeValid && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Only images (JPEG, JPG, PNG, GIF) and PDF files are allowed'));
};

export default multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB for PDF files
  fileFilter
});