import multer from 'multer';
import path from 'path';
import File from '../models/multer.model.js';

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // Unique filename
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Append file extension
  },
});

// Initialize Multer
const upload = multer({ storage });

// Upload a single file
const uploadFile = (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Save file metadata to the database
      const { filename, originalname, mimetype, size } = req.file;
      const fileId = await File.saveFile(filename, originalname, mimetype, size);

      res.status(201).json({
        message: 'File uploaded successfully',
        fileId,
        filePath: `/uploads/${filename}`,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error saving file metadata', error: error.message });
    }
  });
};

// Get all files
const getAllFiles = async (req, res) => {
  try {
    const files = await File.getAllFiles();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
};

// Get a file by ID
const getFileById = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await File.getFileById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching file', error: error.message });
  }
};

// Delete a file by ID
const deleteFile = async (req, res) => {
  const { id } = req.params;

  try {
    const affectedRows = await File.deleteFile(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};

export {
  uploadFile,
  getAllFiles,
  getFileById,
  deleteFile
};

