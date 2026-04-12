CREATE TABLE IF NOT EXISTS Applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  applying_for_class VARCHAR(100) NOT NULL,
  previous_school VARCHAR(255),
  previous_class VARCHAR(100),
  parent_name VARCHAR(255) NOT NULL,
  parent_contact VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255),
  address TEXT,
  additional_info TEXT,
  status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
