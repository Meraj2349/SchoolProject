import express from 'express';
import { uploadFile, getAllFiles, getFileById, deleteFile } from '../controllers/multer.controller.js';

const router = express.Router();

// File upload routes
router.post('/upload', uploadFile); // Upload a file
router.get('/files', getAllFiles); // Get all files
router.get('/files/:id', getFileById); // Get a file by ID
router.delete('/files/:id', deleteFile); // Delete a file by ID

export default router;