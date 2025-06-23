# School Project API

This is a Node.js and Express.js based API for managing students and teachers in a school. The API allows you to perform CRUD operations on students and teachers, as well as search for students and get the total count of students.

## Table of Contents

- [School Project API](#school-project-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
    - [Students](#students)
    - [Teachers](#teachers)
  - [Testing](#testing)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## Features

- Add, update, delete, and fetch students and teachers.
- Search for students by name, class, or section.
- Get the total count of students.
- Middleware for handling authentication (to be implemented).

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL or any other SQL database

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/school-project-api.git
   cd school-project-api# SchoolProject
   ```
2. Install the dependencies:
   `
npm install`

3.Set up the database configuration:

Create a config/db.config.js file with your database connection details.
// filepath: /home/meraj/Dev/SchoolProject/server/config/db.config.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
host: 'localhost',
user: 'root',
password: 'password',
database: 'school_db',
});

export default db;

4.Run the server:
npm start

Usage
The server will start on the port specified in the environment variables or default to 3000. You can access the API at http://localhost:3000.

API Endpoints

GitHub Copilot
Sure, here is a more detailed and standardized README.md for your project:

Install the dependencies:

Set up the database configuration:

Create a config/db.config.js file with your database connection details.
1 vulnerability
Run the server:

Usage
The server will start on the port specified in the environment variables or default to 3000. You can access the API at http://localhost:3000.

API Endpoints
Students
GET /api/students

Fetch all students.
POST /api/students/addStudents

Add a new student.
Body:
DELETE /api/students/deleteStudent/:id

Delete a student by ID.
PUT /api/students/updateStudent/:id

Update a student by ID.
Body:
GET /api/students/search

Search for students by name, class, or section.
Query Parameters: FirstName, Class, Section
GET /api/students/count

Get the total number of students.
GET /api/students/student/:id

Get a student by ID.
Teachers
POST /api/teachers/addTeacher

Add a new teacher.
Body:
GET /api/teachers

Fetch all teachers.
PUT /api/teachers/updateTeacher/:id

Update a teacher by ID.
Body: (similar to add teacher)
DELETE /api/teachers/deleteTeacher/:id

Delete a teacher by ID.
Testing
To test the API endpoints, you can use Postman or any other API testing tool. Refer to the API Endpoints section for details on how to test each endpoint.

Example Postman Requests
GET All Students

Method: GET
URL: http://localhost:3000/api/students
POST Add Student

Method: POST
URL: http://localhost:3000/api/students/addStudents
Body: (raw JSON)
DELETE Delete Student

Method: DELETE
URL: http://localhost:3000/api/students/deleteStudent/1
PUT Update Student

Method: PUT
URL: http://localhost:3000/api/students/updateStudent/1
Body: (raw JSON)
Project Structure
.
├── server
│ ├── config
│ │ └── db.config.js
│ ├── controllers
│ │ ├── student.controller.js
│ │ └── teacher.controller.js
│ ├── middlewares
│ │ └── auth.middleware.js
│ ├── models
│ │ ├── student.model.js
│ │ └── teacher.model.js
│ ├── routes
│ │ ├── student.route.js
│ │ └── teacher.route.js
│ └── app.js
├── package.json
└── README.md

Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -m 'Add some feature').
Push to the branch (git push origin feature-branch).
Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For any questions or inquiries, please contact merajislam2349@gmail.com.



Test the Endpoints:

Upload an Image:

Method: POST
URL: http://localhost:3000/api/images/upload
Body: Use form-data with the following keys:
image: Select an image file.
description: Add a description for the image.
uploadedBy: Provide the ID of the uploader (e.g., 1 for AdminID).
imageType: Specify the type of image (e.g., student, teacher, etc.).
Delete an Image:

Method: DELETE
URL: http://localhost:3000/api/images/delete/:id
Get All Images:

Method: GET
URL: http://localhost:3000/api/images
Get a Single Image:

Method: GET
URL: http://localhost:3000/api/images/:id


///student 
Steps to Test Routes in Postman
Set Up the Base URL:

If your server is running locally, the base URL will likely be http://localhost:<port>. Replace <port> with the port number your server is running on (e.g., http://localhost:3000).
Test Each Route:

Use the following details for each route in Postman:
HTTP Method	Route	Description	Body/Params
GET	/	Fetch all students	None
POST	/addStudents	Add a new student	JSON body with student details (e.g., FirstName, LastName, etc.)
DELETE	/deleteStudent/:id	Delete a student by ID	Replace :id with the student ID in the URL
PUT	/updateStudent/:id	Update a student by ID	Replace :id with the student ID and provide updated details in the JSON body
GET	/search	Search students	Query parameters like FirstName, Class, Section, or roll_number
GET	/count	Get total student count	None
GET	/student/:id	Get a student by ID	Replace :id with the student ID in the URL
PUT	/:id/profile-image	Update student profile image	Replace :id with the student ID and provide imageID in the JSON body
Example JSON Body for POST/PUT Requests:

Check Responses:

Ensure the responses match the expected output (e.g., success messages, error messages, or data).
Debugging:

If a route doesn't work as expected, check the server logs for errors and ensure the database is properly configured.
Let me know if you need help with any specific route or debugging!

{
  "FirstName": "John",
  "LastName": "Doe",
  "DateOfBirth": "2005-06-15",
  "Gender": "Male",
  "Class": "10",
  "Section": "A",
  "AdmissionDate": "2023-01-10",
  "Address": "123 Main St",
  "ParentContact": "9876543210",
  "roll_number": "10-A-001",
  "profile_image_id": "12345"
}

