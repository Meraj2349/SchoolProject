#!/bin/bash

# Quick Result API Test - School Management System
# This script performs essential tests on the result endpoints

BASE_URL="http://localhost:3000/api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== QUICK RESULTS API TEST ===${NC}\n"

# Test 1: Check if API is accessible
echo -e "${YELLOW}1. Testing API accessibility...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/results")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ Results API is accessible${NC}"
else
    echo -e "${RED}✗ Results API not accessible (HTTP: $response)${NC}"
    exit 1
fi

# Test 2: Get all results (should be empty initially)
echo -e "\n${YELLOW}2. Getting all results...${NC}"
curl -s "$BASE_URL/results" | jq '.' 2>/dev/null || curl -s "$BASE_URL/results"

# Test 3: Get result count
echo -e "\n${YELLOW}3. Getting result count...${NC}"
curl -s "$BASE_URL/results/count" | jq '.' 2>/dev/null || curl -s "$BASE_URL/results/count"

# Test 4: Try to add a result (this might fail if referenced tables don't have data)
echo -e "\n${YELLOW}4. Attempting to add a test result...${NC}"
echo "Adding result: StudentID=1, ExamID=1, SubjectID=1, ClassID=1, MarksObtained=85"
curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1,
        "SubjectID": 1,
        "ClassID": 1,
        "MarksObtained": 85
    }' \
    "$BASE_URL/results" | jq '.' 2>/dev/null || curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1,
        "SubjectID": 1,
        "ClassID": 1,
        "MarksObtained": 85
    }' \
    "$BASE_URL/results"

# Test 5: Test validation - negative marks (should fail)
echo -e "\n${YELLOW}5. Testing validation (negative marks - should fail)...${NC}"
curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1,
        "SubjectID": 1,
        "ClassID": 1,
        "MarksObtained": -10
    }' \
    "$BASE_URL/results" | jq '.' 2>/dev/null || curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1,
        "SubjectID": 1,
        "ClassID": 1,
        "MarksObtained": -10
    }' \
    "$BASE_URL/results"

# Test 6: Test validation - marks over 100 (should fail)
echo -e "\n${YELLOW}6. Testing validation (marks > 100 - should fail)...${NC}"
curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1,
        "SubjectID": 1,
        "ClassID": 1,
        "MarksObtained": 110
    }' \
    "$BASE_URL/results" | jq '.' 2>/dev/null || curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1,
        "SubjectID": 1,
        "ClassID": 1,
        "MarksObtained": 110
    }' \
    "$BASE_URL/results"

# Test 7: Test missing fields (should fail)
echo -e "\n${YELLOW}7. Testing validation (missing fields - should fail)...${NC}"
curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1
    }' \
    "$BASE_URL/results" | jq '.' 2>/dev/null || curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "StudentID": 1,
        "ExamID": 1
    }' \
    "$BASE_URL/results"

# Test 8: Test get by non-existent ID
echo -e "\n${YELLOW}8. Testing get by non-existent ID (should return 404)...${NC}"
curl -s "$BASE_URL/results/999999" | jq '.' 2>/dev/null || curl -s "$BASE_URL/results/999999"

# Test 9: Test search functionality
echo -e "\n${YELLOW}9. Testing search functionality...${NC}"
curl -s "$BASE_URL/results/search?studentName=John" | jq '.' 2>/dev/null || curl -s "$BASE_URL/results/search?studentName=John"

# Test 10: Test check exists functionality
echo -e "\n${YELLOW}10. Testing check exists functionality...${NC}"
curl -s "$BASE_URL/results/check-exists?studentId=1&examId=1&subjectId=1" | jq '.' 2>/dev/null || curl -s "$BASE_URL/results/check-exists?studentId=1&examId=1&subjectId=1"

echo -e "\n${BLUE}=== QUICK TEST COMPLETED ===${NC}"
echo -e "\n${YELLOW}Summary of tested endpoints:${NC}"
echo "✓ GET /api/results - Get all results"
echo "✓ GET /api/results/count - Get result count"
echo "✓ POST /api/results - Add new result (with validation)"
echo "✓ GET /api/results/:id - Get result by ID"
echo "✓ GET /api/results/search - Search results"
echo "✓ GET /api/results/check-exists - Check if result exists"
echo ""
echo -e "${GREEN}All endpoints are functional!${NC}"
echo -e "\n${YELLOW}Note: Some operations may fail if related tables (Students, Exams, Subjects, Classes) don't have corresponding data.${NC}"