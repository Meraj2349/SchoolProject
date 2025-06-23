import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/authContext.jsx";
import { uploadImage } from "../../services/imageService.js";
import { toast } from "react-toastify";
import "./ImageUpload.css";

const ImageUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    description: "",
    imageType: "student",
    associatedId: "",
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, file: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, file: "File size should be less than 5MB" });
      return;
    }

    setErrors({ ...errors, file: "" });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const file = fileInputRef.current.files[0];
    if (!file) {
      setErrors({ ...errors, file: "Please select an image file" });
      setIsUploading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", file);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("imageType", formData.imageType);
      formDataToSend.append("associatedId", formData.associatedId);
      formDataToSend.append("uploadedBy", user.id);

      const response = await uploadImage(formDataToSend);

      toast.success("Image uploaded successfully!");
      navigate(`/images/${response.data.imageId}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <h2>Upload New Image</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="image">Select Image*</label>
          <input
            type="file"
            id="image"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className={errors.file ? "error" : ""}
          />
          {errors.file && <span className="error-message">{errors.file}</span>}

          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageType">Image Type*</label>
          <select
            id="imageType"
            name="imageType"
            value={formData.imageType}
            onChange={handleInputChange}
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="school">School</option>
            <option value="event">Event</option>
            <option value="notice">Notice</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="associatedId">Associated ID (Optional)</label>
          <input
            type="text"
            id="associatedId"
            name="associatedId"
            value={formData.associatedId}
            onChange={handleInputChange}
            placeholder="Student or Teacher ID if applicable"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
      </form>
    </div>
  );
};

export default ImageUpload;
