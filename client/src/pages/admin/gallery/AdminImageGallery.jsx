import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imageService from '../../../api/imageService';
import EnhancedImageGallery from '../../../components/EnhancedImageGallery';
import Sidebar from '../../../components/Sidebar';
import './AdminImageGallery.css';

const AdminImageGallery = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    student: 0,
    teacher: 0,
    school: 0,
    event: 0,
    notice: 0
  });
  const [loading, setLoading] = useState(true);

  // Check for token and redirect if not authenticated
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const allImages = await imageService.getImagesWithDetails();
        
        const stats = {
          total: allImages.length,
          student: allImages.filter(img => img.ImageType === 'student').length,
          teacher: allImages.filter(img => img.ImageType === 'teacher').length,
          school: allImages.filter(img => img.ImageType === 'school').length,
          event: allImages.filter(img => img.ImageType === 'event').length,
          notice: allImages.filter(img => img.ImageType === 'notice').length
        };
        
        setStats(stats);
      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to old API if new one fails
        try {
          const allImages = await imageService.getImagesByType('all');
          const stats = {
            total: allImages.length,
            student: allImages.filter(img => img.ImageType === 'student').length,
            teacher: allImages.filter(img => img.ImageType === 'teacher').length,
            school: allImages.filter(img => img.ImageType === 'school').length,
            event: allImages.filter(img => img.ImageType === 'event').length,
            notice: allImages.filter(img => img.ImageType === 'notice').length
          };
          setStats(stats);
        } catch (fallbackError) {
          console.error('Error loading stats with fallback:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="admin-gallery-page">
      <Sidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-page-title">🖼️ Image Gallery Management</h1>
          <p className="admin-page-subtitle">
            Upload, organize, and manage all school images in one place
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-number">{loading ? '...' : stats.total}</div>
            <div className="admin-stat-label">Total Images</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{loading ? '...' : stats.student}</div>
            <div className="admin-stat-label">Student Photos</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{loading ? '...' : stats.teacher}</div>
            <div className="admin-stat-label">Teacher Photos</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{loading ? '...' : stats.school}</div>
            <div className="admin-stat-label">School Images</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{loading ? '...' : stats.event}</div>
            <div className="admin-stat-label">Event Photos</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{loading ? '...' : stats.notice}</div>
            <div className="admin-stat-label">Notice Images</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-actions">
          <button 
            className="admin-action-btn"
            onClick={() => {
              const uploadSection = document.querySelector('.upload-section');
              uploadSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            📤 Quick Upload
          </button>
          <button 
            className="admin-action-btn"
            onClick={() => {
              const filterSection = document.querySelector('.filter-section select');
              if (filterSection) filterSection.value = 'all';
              window.location.reload();
            }}
          >
            🔄 Refresh Gallery
          </button>
        </div>
        
        <div className="admin-gallery-container">
          <EnhancedImageGallery />
        </div>
      </div>
    </div>
  );
};

export default AdminImageGallery;
