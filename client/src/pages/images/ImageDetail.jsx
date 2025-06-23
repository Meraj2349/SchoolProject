import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchImage, deleteImage } from '../../services/imageService.js';
import { useAuth } from '../../store/authContext.jsx';
import { toast } from 'react-toastify';
import './ImageDetail.css';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const getImage = async () => {
      try {
        setLoading(true);
        const response = await fetchImage(id);
        setImage(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching image:', err);
      } finally {
        setLoading(false);
      }
    };

    getImage();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      setIsDeleting(true);
      await deleteImage(id);
      toast.success('Image deleted successfully');
      navigate('/gallery');
    } catch (err) {
      toast.error(err.message || 'Failed to delete image');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="loading">Loading image...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!image) return <div className="not-found">Image not found</div>;

  const canDelete = user && (user.role === 'admin' || user.id === image.UploadedBy);

  return (
    <div className="image-detail-container">
      <div className="image-display">
        <img src={image.ImagePath} alt={image.Description || 'School image'} />
      </div>

      <div className="image-meta">
        <h2>{image.Description || 'Untitled Image'}</h2>
        
        <div className="meta-item">
          <strong>Type:</strong> {image.ImageType}
        </div>

        {image.UploaderName && (
          <div className="meta-item">
            <strong>Uploaded by:</strong> {image.UploaderName} ({image.UploaderRole})
          </div>
        )}

        <div className="meta-item">
          <strong>Upload date:</strong> {new Date(image.UploadDate).toLocaleString()}
        </div>

        {image.AssociatedID && (
          <div className="meta-item">
            <strong>Associated ID:</strong> {image.AssociatedID}
          </div>
        )}

        {canDelete && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="delete-btn"
          >
            {isDeleting ? 'Deleting...' : 'Delete Image'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageDetail;