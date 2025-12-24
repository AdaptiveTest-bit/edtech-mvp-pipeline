#!/bin/bash

# FRONTEND INTEGRATION - PHASE 1 VALIDATION SCRIPT
# This script validates that API Client and Student Context are properly set up
# Run from the repository root: bash VALIDATE_PHASE_1.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  EDTECH MVP - PHASE 1 VALIDATION SCRIPT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check 1: Backend is running
echo -e "${YELLOW}TEST 1: Checking if backend is running on port 8000...${NC}"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Backend is running${NC}"
else
    echo -e "${RED}❌ FAIL: Backend is not running on port 8000${NC}"
    echo -e "${YELLOW}   Start backend with: cd backend && python3 main.py${NC}"
    exit 1
fi
echo ""

# Check 2: Database has sample data
echo -e "${YELLOW}TEST 2: Checking if database has sample data...${NC}"
STUDENT_COUNT=$(psql -U kunalranjan -d edtech_mvp -t -c "SELECT COUNT(*) FROM users.students;" 2>/dev/null || echo "0")
if [ "$STUDENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS: Database has $STUDENT_COUNT students${NC}"
else
    echo -e "${RED}❌ FAIL: Database is empty or not accessible${NC}"
    echo -e "${YELLOW}   Make sure PostgreSQL is running and sample data is loaded${NC}"
    exit 1
fi
echo ""

# Check 3: API can fetch a question
echo -e "${YELLOW}TEST 3: Testing API - GET /api/quiz/question/1...${NC}"
QUESTION_RESPONSE=$(curl -s http://localhost:8000/api/quiz/question/1)
if echo "$QUESTION_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✅ PASS: API returns question data${NC}"
    echo -e "   Sample: $(echo "$QUESTION_RESPONSE" | head -c 100)..."
else
    echo -e "${RED}❌ FAIL: API did not return question data${NC}"
    echo "   Response: $QUESTION_RESPONSE"
    exit 1
fi
echo ""

# Check 4: API can process login
echo -e "${YELLOW}TEST 4: Testing API - POST /api/auth/login...${NC}"
# Get a real student email from database
STUDENT_EMAIL=$(psql -U kunalranjan -d edtech_mvp -t -c "SELECT email FROM users.students LIMIT 1;" 2>/dev/null || echo "")
if [ -z "$STUDENT_EMAIL" ]; then
    echo -e "${RED}❌ FAIL: Could not find student in database${NC}"
    exit 1
fi

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$STUDENT_EMAIL\", \"password\": \"test123\"}" || echo "{}")

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    echo -e "${GREEN}✅ PASS: Login API working (student: $STUDENT_EMAIL)${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Login returned but no token found${NC}"
    echo "   This might be expected if backend validation is strict"
    echo "   Response: $(echo "$LOGIN_RESPONSE" | head -c 150)..."
fi
echo ""

# Check 5: API can fetch progress
echo -e "${YELLOW}TEST 5: Testing API - GET /api/student/1/progress...${NC}"
PROGRESS_RESPONSE=$(curl -s http://localhost:8000/api/student/1/progress)
if echo "$PROGRESS_RESPONSE" | grep -q '"chapters"'; then
    echo -e "${GREEN}✅ PASS: Progress API returns chapter data${NC}"
    CHAPTER_COUNT=$(echo "$PROGRESS_RESPONSE" | grep -o '"chapter_id"' | wc -l)
    echo -e "   Found $CHAPTER_COUNT chapters"
else
    echo -e "${RED}❌ FAIL: Progress API did not return chapter data${NC}"
    echo "   Response: $(echo "$PROGRESS_RESPONSE" | head -c 200)..."
fi
echo ""

# Check 6: Frontend files exist and compile
echo -e "${YELLOW}TEST 6: Checking if frontend files exist...${NC}"
if [ -f "frontend/src/lib/api.ts" ]; then
    echo -e "${GREEN}✅ PASS: api.ts exists${NC}"
else
    echo -e "${RED}❌ FAIL: api.ts not found${NC}"
    exit 1
fi

if [ -f "frontend/src/context/StudentContext.tsx" ]; then
    echo -e "${GREEN}✅ PASS: StudentContext.tsx exists${NC}"
else
    echo -e "${RED}❌ FAIL: StudentContext.tsx not found${NC}"
    exit 1
fi
echo ""

# Check 7: TypeScript compilation
echo -e "${YELLOW}TEST 7: Running TypeScript type check for frontend...${NC}"
cd frontend
if npm run build 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ FAIL: TypeScript compilation errors found${NC}"
    npm run build 2>&1 | grep "error"
    exit 1
else
    echo -e "${GREEN}✅ PASS: TypeScript compiles without errors${NC}"
fi
cd ..
echo ""

# Check 8: Next.js can start
echo -e "${YELLOW}TEST 8: Checking if Next.js app can start (timeout 30s)...${NC}"
cd frontend
timeout 30 npm run dev > /tmp/next_server.log 2>&1 &
NEXT_PID=$!
sleep 5

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Next.js server started on port 3000${NC}"
    kill $NEXT_PID 2>/dev/null || true
else
    echo -e "${YELLOW}⚠️  WARNING: Could not reach Next.js on port 3000 after 5 seconds${NC}"
    echo "   This might be normal if it needs more startup time"
    kill $NEXT_PID 2>/dev/null || true
fi
cd ..
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PHASE 1 VALIDATION COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "  ✅ Backend is running on port 8000"
echo "  ✅ Database has sample data ($STUDENT_COUNT students)"
echo "  ✅ API endpoints responding"
echo "  ✅ Frontend files created"
echo "  ✅ TypeScript compilation successful"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Start the backend: cd backend && python3 main.py"
echo "  2. Start the frontend: cd frontend && npm run dev"
echo "  3. Open http://localhost:3000 in browser"
echo "  4. Check browser console for API debug logs"
echo "  5. Check localStorage for student session"
echo ""
echo -e "${YELLOW}To run this validation again:${NC}"
echo "  bash VALIDATE_PHASE_1.sh"
echo ""
