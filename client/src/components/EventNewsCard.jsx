import { Link } from 'react-router-dom';

const EventNewsCard = ({ type, data, containerStyle = {} }) => {
  const baseStyle = {
    flex: 1,
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    padding: '0',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...containerStyle
  };

  const headerStyle = {
    background: type === 'events' ? '#6fcf97' : '#f2994a',
    color: '#fff',
    padding: '16px 18px',
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const getDateStyle = (type) => ({
    minWidth: type === 'news' ? 70 : 56,
    minHeight: 56,
    background: type === 'events' ? '#6fcf97' : '#f2994a',
    color: '#fff',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: type === 'news' ? 12 : 18,
    marginRight: 16,
    padding: type === 'news' ? '4px' : '0',
    textAlign: 'center'
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
            marginBottom: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: idx % 2 === 0 ? '#f8f9fa' : '#ffffff',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            e.currentTarget.style.background = type === 'events' ? '#e8f5e8' : '#fff3e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            e.currentTarget.style.background = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
          }}
          >
            <div style={getDateStyle(type)}>
              {formatDate(item.date, type)}
            </div>
            <Link 
              to={item.link || '#'} 
              style={{ 
                color: '#222', 
                fontSize: 16, 
                lineHeight: 1.4, 
                textDecoration: 'none',
                flex: 1,
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.color = type === 'events' ? '#27ae60' : '#e67e22'}
              onMouseLeave={(e) => e.target.style.color = '#222'}
            >
              {item.text}
            </Link>
          </div>
        ))}
        
        {/* More link at bottom */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'auto', 
          paddingTop: '16px',
          borderTop: '1px solid #eee'
        }}>
          <Link 
            to={`/${type}`} 
            style={{ 
              color: '#3498db', 
              textDecoration: 'none', 
              fontSize: 16,
              fontWeight: 500
            }}
          >
            More...
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventNewsCard;
