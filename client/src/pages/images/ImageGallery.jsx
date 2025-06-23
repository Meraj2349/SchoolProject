import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchImages } from '../../services/imageService.js';
import { useAuth } from '../../store/authContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import './ImageGallery.css';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    page: 1,
    limit: 12
  });
  const [totalItems, setTotalItems] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const getImages = async () => {
      try {
        setLoading(true);
        const response = await fetchImages(filters);
        setImages(response.data);
        setTotalItems(response.total);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };

    getImages();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (loading) return <div className="loading">Loading images...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Image Gallery</h2>
        
        {user && (
          <Link to="/upload" className="upload-link">
            Upload New Image
          </Link>
        )}
      </div>

      <div className="filters">
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="school">School</option>
          <option value="event">Event</option>
          <option value="notice">Notice</option>
        </select>
      </div>

      {images.length === 0 ? (
        <div className="no-images">No images found</div>
      ) : (
        <>
          <div className="image-grid">
            {images.map((image) => (
              <div key={image.ImageID} className="image-card">
                <Link to={`/images/${image.ImageID}`}>
                  <img 
                    src={image.ImagePath} 
                    alt={image.Description || 'School image'} 
                    loading="lazy"
                  />
                </Link>
                <div className="image-info">
                  <span className="image-type">{image.ImageType}</span>
                  {image.Description && (
                    <p className="image-desc">{image.Description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={filters.page}
            totalItems={totalItems}
            itemsPerPage={filters.limit}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ImageGallery;