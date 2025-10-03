import { Link } from 'react-router-dom';

const EventNewsCard = ({ type, data, containerStyle = {} }) => {
  const baseStyle = {
    flex: 1,
    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    padding: '0',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...containerStyle
  };

  const headerStyle = {
    background: type === 'events' ? 
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' :
      'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white',
    padding: '16px 20px',
    fontSize: '1.1rem',
    fontWeight: '600',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    borderBottom: 'none',
    position: 'relative'
  };

  const getDateStyle = (type) => ({
    minWidth: type === 'news' ? 70 : 60,
    minHeight: 60,
    background: type === 'events' ? 
      'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fff',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: type === 'news' ? 11 : 16,
    marginRight: 16,
    padding: type === 'news' ? '6px' : '8px',
    textAlign: 'center',
    boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
    border: '2px solid rgba(255,255,255,0.2)'
  });

  const formatDate = (date, type) => {
    if (type === 'events') {
      const parts = date.split(' ');
      return (
        <>
          <span style={{ fontSize: 16 }}>{parts[0]}</span>
          <span style={{ fontSize: 22 }}>{parts[1]}</span>
        </>
      );
    } else {
      // For news, handle longer date format better
      return <span style={{ fontSize: 11, lineHeight: 1.2 }}>{date}</span>;
    }
  };

  return (
    <div style={baseStyle}>
      {/* Header */}
      <div style={headerStyle}>
        {type === 'events' ? 'EVENTS' : 'NEWS'}
      </div>
      
      {/* Content */}
      <div style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: type === 'events' ? 'center' : 'flex-start', 
            marginBottom: idx === data.length - 1 ? '0' : '12px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: '#ffffff',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = type === 'events' ? '#6366f1' : '#06b6d4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
          }}
          >
            <div style={getDateStyle(type)}>
              {formatDate(item.date, type)}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link 
                to={item.link || '#'} 
                style={{ 
                  color: '#1f2937', 
                  fontSize: '14px', 
                  lineHeight: 1.4, 
                  textDecoration: 'none',
                  display: 'block',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = type === 'events' ? '#6366f1' : '#06b6d4'}
                onMouseLeave={(e) => e.target.style.color = '#1f2937'}
              >
                {item.text || item.title || item.name}
              </Link>
              
              {item.description && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {item.description}
                </div>
              )}
              
              {item.venue && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  width: 'fit-content'
                }}>
                  <span style={{ fontSize: '10px' }}>📍</span> {item.venue}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* More link at bottom */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'auto', 
          paddingTop: '16px',
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}>
          <Link 
            to={`/${type}`} 
            style={{ 
              color: type === 'events' ? '#6366f1' : '#06b6d4',
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '20px',
              background: type === 'events' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(6, 182, 212, 0.1)',
              border: `1px solid ${type === 'events' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(6, 182, 212, 0.2)'}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = type === 'events' ? '#6366f1' : '#06b6d4';
              e.target.style.color = '#ffffff';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = type === 'events' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(6, 182, 212, 0.1)';
              e.target.style.color = type === 'events' ? '#6366f1' : '#06b6d4';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            View All {type.charAt(0).toUpperCase() + type.slice(1)} <span style={{ fontSize: '12px' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventNewsCard;
