#!/bin/bash

# Simple API Test Script for Simplified Exam Model
# Note: This requires the server to be running on port 5000

BASE_URL="http://localhost:5000/api/exams"

echo "🧪 Testing Simplified Exam API Endpoints"
echo "========================================"

echo ""
echo "1. Testing GET /api/exams (Get all exams)"
echo "curl -X GET $BASE_URL"
curl -X GET $BASE_URL -s | head -c 200
echo ""
echo ""

echo "2. Testing GET /api/exams/1 (Get exam by ID)"
echo "curl -X GET $BASE_URL/1"
curl -X GET $BASE_URL/1 -s | head -c 200
echo ""
echo ""

echo "3. Testing POST /api/exams/by-class (Add exam by class details)"
echo "curl -X POST $BASE_URL/by-class -H 'Content-Type: application/json' -d '{\"examType\": \"Monthly\", \"examName\": \"Math Test\", \"className\": \"Class 10\", \"sectionName\": \"A\", \"examDate\": \"2025-08-15\"}'"
curl -X POST $BASE_URL/by-class \
  -H "Content-Type: application/json" \
  -d '{"examType": "Monthly", "examName": "Math Test", "className": "Class 10", "sectionName": "A", "examDate": "2025-08-15"}' \
  -s | head -c 300
echo ""
echo ""

echo "4. Testing GET /api/exams/class/1 (Get exams by class)"
echo "curl -X GET $BASE_URL/class/1"
curl -X GET $BASE_URL/class/1 -s | head -c 200
echo ""
echo ""

echo "5. Testing PUT /api/exams/1 (Update exam)"
echo "curl -X PUT $BASE_URL/1 -H 'Content-Type: application/json' -d '{\"ExamName\": \"Updated Math Test\"}'"
curl -X PUT $BASE_URL/1 \
  -H "Content-Type: application/json" \
  -d '{"ExamName": "Updated Math Test"}' \
  -s | head -c 200
echo ""
echo ""

echo "6. Testing DELETE /api/exams/999 (Delete exam - using high ID to avoid deleting real data)"
echo "curl -X DELETE $BASE_URL/999"
curl -X DELETE $BASE_URL/999 -s | head -c 200
echo ""
echo ""

echo "✅ Basic endpoint tests completed!"
echo "📝 Note: Start server with 'cd server && npm start' to run actual tests"
echo "🎯 Simplified Exam API includes only basic CRUD operations as requested:"
echo "   - GET /api/exams (all exams)"
echo "   - GET /api/exams/:id (exam by ID)"
echo "   - GET /api/exams/class/:classId (exams by class)"
echo "   - POST /api/exams/by-class (add exam by class name/section)"
echo "   - PUT /api/exams/:id (update exam)"
echo "   - DELETE /api/exams/:id (delete exam)"
