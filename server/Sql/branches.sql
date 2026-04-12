-- Branches Table for School Management System
CREATE TABLE
    IF NOT EXISTS Branches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name_bn VARCHAR(255),
        name_en VARCHAR(255),
        description_bn TEXT,
        description_en TEXT,
        image_url VARCHAR(500),
        image_public_id VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address_bn VARCHAR(500),
        address_en VARCHAR(500),
        is_proposed BOOLEAN DEFAULT FALSE,
        established_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );