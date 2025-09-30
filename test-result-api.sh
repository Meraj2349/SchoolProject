#!/bin/bash

# Test Results API - School Management System
# This script tests all result endpoints with the database schema:
# Results (ResultID, StudentID, ExamID, SubjectID, ClassID, MarksObtained)

# Set base URL
BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print test headers
print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Method: $method"
    echo "Endpoint: $BASE_URL$endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
        http_code="${response: -3}"
        body="${response%???}"
    else
        response=$(curl -s -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
        http_code="${response: -3}"
        body="${response%???}"
    fi
    
    echo "HTTP Status: $http_code"
    echo "Response: $body"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_success "$description"
        return 0
    else
        print_error "$description (HTTP: $http_code)"
        return 1
    fi
}

# Start testing
print_header "RESULTS API TESTING"

echo "Testing Results API endpoints based on database schema:"
echo "Results (ResultID, StudentID, ExamID, SubjectID, ClassID, MarksObtained)"

# Test 1: Get all results
print_header "1. GET ALL RESULTS"
test_endpoint "GET" "/results" "" "Get all results"

# Test 2: Get result count
print_header "2. GET RESULT COUNT"
test_endpoint "GET" "/results/count" "" "Get total result count"

# Test 3: Add a new result (assuming we have some test data)
print_header "3. ADD NEW RESULT"
echo "Adding a test result (StudentID: 1, ExamID: 1, SubjectID: 1, ClassID: 1, MarksObtained: 85)"
test_endpoint "POST" "/results" '{
    "StudentID": 1,
    "ExamID": 1,
    "SubjectID": 1,
    "ClassID": 1,
    "MarksObtained": 85
}' "Add new result"

# Test 4: Add result with validation errors
print_header "4. VALIDATION TESTING"
echo "Testing with missing fields..."
test_endpoint "POST" "/results" '{
    "StudentID": 1,
    "ExamID": 1
}' "Add result with missing fields (should fail)"

echo -e "\nTesting with invalid marks (negative)..."
test_endpoint "POST" "/results" '{
    "StudentID": 1,
    "ExamID": 1,
    "SubjectID": 1,
    "ClassID": 1,
    "MarksObtained": -10
}' "Add result with negative marks (should fail)"

echo -e "\nTesting with invalid marks (>100)..."
test_endpoint "POST" "/results" '{
    "StudentID": 1,
    "ExamID": 1,
    "SubjectID": 1,
    "ClassID": 1,
    "MarksObtained": 110
}' "Add result with marks > 100 (should fail)"

# Test 5: Get result by ID
print_header "5. GET RESULT BY ID"
test_endpoint "GET" "/results/1" "" "Get result by ID (ID: 1)"

# Test 6: Get results by student
print_header "6. GET RESULTS BY STUDENT"
test_endpoint "GET" "/results/student/1" "" "Get results by student ID (StudentID: 1)"

# Test 7: Get results by exam
print_header "7. GET RESULTS BY EXAM"
test_endpoint "GET" "/results/exam/1" "" "Get results by exam ID (ExamID: 1)"

# Test 8: Get results by class
print_header "8. GET RESULTS BY CLASS"
test_endpoint "GET" "/results/class/1" "" "Get results by class ID (ClassID: 1)"

# Test 9: Get results by subject
print_header "9. GET RESULTS BY SUBJECT"
test_endpoint "GET" "/results/subject/1" "" "Get results by subject ID (SubjectID: 1)"

# Test 10: Get student result summary
print_header "10. GET STUDENT RESULT SUMMARY"
test_endpoint "GET" "/results/summary/1/1" "" "Get student result summary (StudentID: 1, ExamID: 1)"

# Test 11: Search results
print_header "11. SEARCH RESULTS"
test_endpoint "GET" "/results/search?studentName=John&className=10" "" "Search results by student name and class"

# Test 12: Advanced search
print_header "12. ADVANCED SEARCH"
test_endpoint "GET" "/results/search/advanced?minMarks=80&maxMarks=100&limit=10" "" "Advanced search with marks filter"

# Test 13: Check if result exists
print_header "13. CHECK RESULT EXISTS"
test_endpoint "GET" "/results/check-exists?studentId=1&examId=1&subjectId=1" "" "Check if result exists"

# Test 14: Add multiple results (batch)
print_header "14. ADD MULTIPLE RESULTS (BATCH)"
echo "Adding multiple results in batch..."
test_endpoint "POST" "/results/batch" '{
    "results": [
        {
            "StudentID": 2,
            "ExamID": 1,
            "SubjectID": 1,
            "ClassID": 1,
            "MarksObtained": 78
        },
        {
            "StudentID": 2,
            "ExamID": 1,
            "SubjectID": 2,
            "ClassID": 1,
            "MarksObtained": 82
        }
    ]
}' "Add multiple results in batch"

# Test 15: Add result by student details (using names instead of IDs)
print_header "15. ADD RESULT BY STUDENT DETAILS"
echo "Adding result using student name and details..."
test_endpoint "POST" "/results/add-by-details" '{
    "studentName": "John Doe",
    "rollNumber": "001",
    "className": "10",
    "sectionName": "A",
    "examName": "Midterm",
    "subjectName": "Mathematics",
    "marksObtained": 88
}' "Add result by student details"

# Test 16: Update result
print_header "16. UPDATE RESULT"
echo "Updating result with ID 1..."
test_endpoint "PUT" "/results/1" '{
    "StudentID": 1,
    "ExamID": 1,
    "SubjectID": 1,
    "ClassID": 1,
    "MarksObtained": 90
}' "Update result"

# Test 17: Invalid endpoint tests
print_header "17. INVALID ENDPOINT TESTS"
test_endpoint "GET" "/results/999999" "" "Get non-existent result (should return 404)"
test_endpoint "GET" "/results/student/999999" "" "Get results for non-existent student"
test_endpoint "GET" "/results/exam/999999" "" "Get results for non-existent exam"

# Test 18: Delete result
print_header "18. DELETE RESULT"
echo "Deleting result with ID 1..."
test_endpoint "DELETE" "/results/1" "" "Delete result"

# Test 19: Delete results by exam
print_header "19. DELETE RESULTS BY EXAM"
echo "Deleting all results for exam ID 1..."
test_endpoint "DELETE" "/results/exam/1" "" "Delete results by exam"

# Final summary
print_header "TEST SUMMARY"
echo "All result API endpoints have been tested!"
echo ""
echo "Key endpoints tested:"
echo "• GET /results - Get all results"
echo "• GET /results/count - Get result count"
echo "• POST /results - Add new result"
echo "• POST /results/batch - Add multiple results"
echo "• POST /results/add-by-details - Add result by student details"
echo "• GET /results/:id - Get result by ID"
echo "• PUT /results/:id - Update result"
echo "• DELETE /results/:id - Delete result"
echo "• GET /results/student/:studentId - Get results by student"
echo "• GET /results/exam/:examId - Get results by exam"
echo "• GET /results/class/:classId - Get results by class"
echo "• GET /results/subject/:subjectId - Get results by subject"
echo "• GET /results/summary/:studentId/:examId - Get student result summary"
echo "• GET /results/search - Basic search results"
echo "• GET /results/search/advanced - Advanced search with pagination"
echo "• GET /results/check-exists - Check if result exists"
echo "• DELETE /results/exam/:examId - Delete results by exam"
echo ""
echo -e "${GREEN}Testing completed!${NC}"
echo ""
echo "Database Schema Being Tested:"
echo "Results ("
echo "  ResultID INT PRIMARY KEY AUTO_INCREMENT,"
echo "  StudentID INT NOT NULL,"
echo "  ExamID INT NOT NULL,"
echo "  SubjectID INT NOT NULL,"
echo "  ClassID INT NOT NULL,"
echo "  MarksObtained INT NOT NULL,"
echo "  FOREIGN KEY (StudentID) REFERENCES Students (StudentID),"
echo "  FOREIGN KEY (ExamID) REFERENCES Exams (ExamID),"
echo "  FOREIGN KEY (SubjectID) REFERENCES Subjects (SubjectID),"
echo "  FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)"
echo ");"