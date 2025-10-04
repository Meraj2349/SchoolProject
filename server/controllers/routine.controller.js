import fs from "fs";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.config.js";
import * as RoutineModel from "../models/routine.model.js";

// Create new routine with file upload (Classes table structure follow করে)
export const createRoutine = async (req, res) => {
  try {
    console.log("Create routine request received");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const { RoutineTitle, ClassID, RoutineDate, Description } = req.body;

    // Validate required fields (Classes table structure অনুযায়ী)
    if (!RoutineTitle || !ClassID || !RoutineDate) {
      return res.status(400).json({ 
        message: "Missing required fields: RoutineTitle, ClassID, RoutineDate" 
      });
    }

    // Validate class exists (Classes table থেকে ClassName এবং Section পাওয়ার জন্য)
    const classInfo = await RoutineModel.validateClassId(ClassID);
    if (!classInfo) {
      return res.status(400).json({ 
        message: `Invalid ClassID: ${ClassID}. Class does not exist.` 
      });
    }

    let routineData = {
      RoutineTitle,
      ClassID: parseInt(ClassID),
      RoutineDate,
      Description: Description || null,
      CreatedBy: req.adminId || null // From auth middleware
    };

    // Handle file upload if present (with Cloudinary fallback)
    if (req.file) {
      try {
        // Try to upload to Cloudinary with timeout
        console.log("Attempting Cloudinary upload...");
        const uploadPromise = uploadToCloudinary(req.file.path, "school/routines");
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cloudinary timeout')), 15000)
        );
        
        const result = await Promise.race([uploadPromise, timeoutPromise]);

        routineData.FileURL = result.secure_url;
        routineData.FilePublicID = result.public_id;
        
        // Determine file type based on format
        const fileFormat = result.format?.toLowerCase() || 'pdf';
        if (['pdf'].includes(fileFormat)) {
          routineData.FileType = 'pdf';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileFormat)) {
          routineData.FileType = 'image';
        } else {
          routineData.FileType = 'pdf'; // Default
        }

        // Clean up local file after successful upload
        fs.unlinkSync(req.file.path);
        
        console.log("File uploaded to Cloudinary successfully:", result.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        
        // Fallback: Save file locally and continue without Cloudinary
        console.log("Using local file storage as fallback...");
        
        try {
          // Move file to permanent location with a clean filename
          const fileExtension = req.file.originalname.split('.').pop();
          const newFilename = `routine_${Date.now()}.${fileExtension}`;
          const newPath = `/uploads/${newFilename}`;
          const fullPath = `${process.cwd()}/public${newPath}`;
          
          // Ensure uploads directory exists
          const uploadsDir = `${process.cwd()}/public/uploads`;
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // Move file to permanent location
          fs.renameSync(req.file.path, fullPath);
          
          // Use local file path
          routineData.FileURL = `http://localhost:3000${newPath}`;
          routineData.FilePublicID = null; // No Cloudinary ID
          
          // Determine file type from extension
          const fileExt = fileExtension?.toLowerCase();
          if (['pdf'].includes(fileExt)) {
            routineData.FileType = 'pdf';
          } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
            routineData.FileType = 'image';
          } else {
            routineData.FileType = 'pdf'; // Default
          }
          
          console.log("File saved locally:", routineData.FileURL);
          
        } catch (localError) {
          console.error("Local file save error:", localError);
          // Clean up original file
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(500).json({ 
            message: "File upload failed - both Cloudinary and local storage failed", 
            error: `Cloudinary: ${uploadError.message}, Local: ${localError.message}`
          });
        }
      }
    }

    const routine = await RoutineModel.createRoutine(routineData);
    res.status(201).json({
      message: "Routine created successfully",
      routine,
      classInfo: {
        ClassID: classInfo.ClassID,
        ClassName: classInfo.ClassName,
        Section: classInfo.Section
      }
    });

  } catch (error) {
    console.error("Create routine error:", error);
    // Clean up local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: "Error creating routine", 
      error: error.message 
    });
  }
};

// Get all routines with class names and sections
export const getAllRoutines = async (req, res) => {
  try {
    const routines = await RoutineModel.getAllRoutines();
    res.status(200).json({
      message: "Routines retrieved successfully",
      count: routines.length,
      routines
    });
  } catch (error) {
    console.error("Get all routines error:", error);
    res.status(500).json({ 
      message: "Error retrieving routines", 
      error: error.message 
    });
  }
};

// Get routine by ID with class name and section
export const getRoutineById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid routine ID is required" });
    }

    const routine = await RoutineModel.getRoutineById(id);
    
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.status(200).json({
      message: "Routine retrieved successfully",
      routine
    });
  } catch (error) {
    console.error("Get routine by ID error:", error);
    res.status(500).json({ 
      message: "Error retrieving routine", 
      error: error.message 
    });
  }
};

// Get routines by class and section (for filtering)
export const getRoutinesByClassSection = async (req, res) => {
  try {
    const { className, section } = req.query;
    
    const routines = await RoutineModel.getRoutinesByClassSection(className, section);
    
    res.status(200).json({
      message: "Routines retrieved successfully",
      count: routines.length,
      filters: { className: className || 'all', section: section || 'all' },
      routines
    });
  } catch (error) {
    console.error("Get routines by class/section error:", error);
    res.status(500).json({ 
      message: "Error retrieving routines", 
      error: error.message 
    });
  }
};

// Get routines by ClassID (specific ClassID দিয়ে)
export const getRoutinesByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!classId || isNaN(classId)) {
      return res.status(400).json({ message: "Valid ClassID is required" });
    }

    const routines = await RoutineModel.getRoutinesByClassId(classId);
    
    res.status(200).json({
      message: "Routines retrieved successfully",
      count: routines.length,
      ClassID: parseInt(classId),
      routines
    });
  } catch (error) {
    console.error("Get routines by ClassID error:", error);
    res.status(500).json({ 
      message: "Error retrieving routines", 
      error: error.message 
    });
  }
};

// Update routine with class validation (Classes table structure follow করে)
export const updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid routine ID is required" });
    }

    // Check if routine exists
    const existingRoutine = await RoutineModel.getRoutineById(id);
    if (!existingRoutine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    let updateData = { ...req.body };

    // Validate ClassID if provided (Classes table এ exist করে কিনা check)
    if (updateData.ClassID) {
      const classInfo = await RoutineModel.validateClassId(updateData.ClassID);
      if (!classInfo) {
        return res.status(400).json({ 
          message: `Invalid ClassID: ${updateData.ClassID}. Class does not exist.` 
        });
      }
      updateData.ClassID = parseInt(updateData.ClassID);
    }

    // Handle file upload if present
    if (req.file) {
      try {
        // Delete old file from Cloudinary if exists
        if (existingRoutine.FilePublicID) {
          try {
            await deleteFromCloudinary(existingRoutine.FilePublicID);
            console.log("Old file deleted from Cloudinary");
          } catch (deleteError) {
            console.error("Error deleting old file:", deleteError);
          }
        }

        // Upload new file using your existing function
        const result = await uploadToCloudinary(req.file.path, "school/routines");

        updateData.FileURL = result.secure_url;
        updateData.FilePublicID = result.public_id;
        
        // Determine file type
        const fileFormat = result.format?.toLowerCase() || 'pdf';
        if (['pdf'].includes(fileFormat)) {
          updateData.FileType = 'pdf';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileFormat)) {
          updateData.FileType = 'image';
        }

        // Clean up local file
        fs.unlinkSync(req.file.path);
        
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          message: "File upload failed", 
          error: uploadError.message 
        });
      }
    }

    const updatedRoutine = await RoutineModel.updateRoutine(id, updateData);
    
    res.status(200).json({
      message: "Routine updated successfully",
      routine: updatedRoutine
    });

  } catch (error) {
    console.error("Update routine error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: "Error updating routine", 
      error: error.message 
    });
  }
};

// Delete routine (ClassName এবং Section show করে delete confirmation)
export const deleteRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid routine ID is required" });
    }

    // Get routine to delete file from Cloudinary এবং class info show করার জন্য
    const routine = await RoutineModel.getRoutineById(id);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    // Delete file from Cloudinary if exists (following your pattern)
    if (routine.FilePublicID) {
      try {
        await deleteFromCloudinary(routine.FilePublicID);
        console.log("File deleted from Cloudinary");
      } catch (deleteError) {
        console.error("Error deleting file from Cloudinary:", deleteError);
      }
    }

    const deleted = await RoutineModel.deleteRoutine(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Routine not found or already deleted" });
    }

    res.status(200).json({ 
      message: "Routine deleted successfully",
      deletedRoutine: {
        RoutineID: routine.RoutineID,
        RoutineTitle: routine.RoutineTitle,
        ClassName: routine.ClassName,
        Section: routine.Section,
        ClassSectionName: routine.ClassSectionName
      }
    });

  } catch (error) {
    console.error("Delete routine error:", error);
    res.status(500).json({ 
      message: "Error deleting routine", 
      error: error.message 
    });
  }
};

// Search routines
export const searchRoutines = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search term must be at least 2 characters" });
    }

    const routines = await RoutineModel.searchRoutines(q.trim());
    
    res.status(200).json({
      message: "Search completed successfully",
      searchTerm: q,
      count: routines.length,
      routines
    });
  } catch (error) {
    console.error("Search routines error:", error);
    res.status(500).json({ 
      message: "Error searching routines", 
      error: error.message 
    });
  }
};

// Get all available classes (Classes table থেকে dropdown এর জন্য)
export const getAllClasses = async (req, res) => {
  try {
    const classes = await RoutineModel.getAllClasses();
    
    res.status(200).json({
      message: "Classes retrieved successfully",
      count: classes.length,
      classes
    });
  } catch (error) {
    console.error("Get all classes error:", error);
    res.status(500).json({ 
      message: "Error retrieving classes", 
      error: error.message 
    });
  }
};

// Get filter options (Classes table থেকে distinct ClassName এবং Section)
export const getFilterOptions = async (req, res) => {
  try {
    const classes = await RoutineModel.getDistinctClasses();
    const sections = await RoutineModel.getDistinctSections();
    
    res.status(200).json({
      message: "Filter options retrieved successfully",
      options: {
        classes,
        sections
      }
    });
  } catch (error) {
    console.error("Get filter options error:", error);
    res.status(500).json({ 
      message: "Error retrieving filter options", 
      error: error.message 
    });
  }
};

// Get sections by class name (dynamic section loading এর জন্য)
export const getSectionsByClassName = async (req, res) => {
  try {
    const { className } = req.params;
    
    if (!className) {
      return res.status(400).json({ message: "ClassName is required" });
    }

    const sections = await RoutineModel.getSectionsByClassName(className);
    
    res.status(200).json({
      message: "Sections retrieved successfully",
      ClassName: className,
      count: sections.length,
      sections
    });
  } catch (error) {
    console.error("Get sections by ClassName error:", error);
    res.status(500).json({ 
      message: "Error retrieving sections", 
      error: error.message 
    });
  }
};