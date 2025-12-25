# 🚀 SETUP & DEVELOPMENT GUIDE

**Updated:** December 25, 2025  
**Version:** 2.0 (Tailwind v4, Phase 2 Complete)

---

## 📦 Prerequisites

### System Requirements
- **Node.js:** v18+ (check: `node --version`)
- **Python:** 3.9+ (check: `python3 --version`)
- **PostgreSQL:** 12+ (check: `psql --version`)
- **npm:** v9+ (check: `npm --version`)

### Accounts & Services
- PostgreSQL database access
- GitHub (for version control)

---

## 💾 Database Setup

### 1. Create Database
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE edtech_mvp;

# Create user (optional, if needed)
CREATE USER edtech WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE edtech_mvp TO edtech;

# Exit
\q
```

### 2. Run Migrations
```bash
cd backend/database/DDL

# Execute all migration files in order
psql -U postgres -d edtech_mvp -f 00_users.sql
psql -U postgres -d edtech_mvp -f 01_curriculum.sql
psql -U postgres -d edtech_mvp -f 02_analytics.sql
psql -U postgres -d edtech_mvp -f 03_quiz_submissions.sql
psql -U postgres -d edtech_mvp -f 04_student_progress.sql
psql -U postgres -d edtech_mvp -f 05_indexes.sql
psql -U postgres -d edtech_mvp -f 06_onboarding.sql
psql -U postgres -d edtech_mvp -f 07_missions.sql
```

### 3. Verify Tables
```bash
psql -U postgres -d edtech_mvp -c "\dt"
```

Expected output: 7 tables created ✅

---

## 🔧 Backend Setup

### 1. Install Python Dependencies
```bash
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment
Edit `backend/app/core/config.py`:
```python
DATABASE_URL = "postgresql://user:password@localhost:5432/edtech_mvp"
DEBUG = True  # Set to False for production
```

### 3. Start Backend Server
```bash
# From backend directory
python main.py

# Output should show:
# Uvicorn running on http://127.0.0.1:8000
# Press CTRL+C to quit
```

### 4. Verify Backend
```bash
# In another terminal
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","message":"Backend is running",...}
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd frontend

npm install
# or
npm ci  # For exact versions
```

### 2. Environment Variables
Create `.env.local` (if needed):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Development Server
```bash
npm run dev

# Output should show:
# ▲ Next.js 16.1.0
# - Local:        http://localhost:3000
```

### 4. Verify Frontend
Open http://localhost:3000 in browser. You should see:
- ✅ Home page with Sign In/Sign Up buttons
- ✅ Navbar at top
- ✅ No console errors

---

## 🧪 Testing the Full Stack

### Test 1: Health Checks
```bash
# Backend health
curl http://localhost:8000/health
# Expected: {"status":"ok",...}

# Frontend loading
curl http://localhost:3000 | head -20
# Expected: HTML response with navbar
```

### Test 2: User Registration Flow
```bash
# Create new account
curl -X POST http://localhost:8000/api/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "grade_level": 10
  }'

# Expected: {"id": 1, "email": "test@example.com", "token": "..."}
```

### Test 3: Create Test Mission
```bash
curl -X POST http://localhost:8000/api/missions/create/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Master Math Basics",
    "description": "Solve 10 math problems",
    "reward_xp": 75
  }'

# Expected: {"status": "success", "mission": {...}}
```

### Test 4: UI Testing
1. Open http://localhost:3000/register
2. Fill in form and click "Create Account"
3. Should redirect to http://localhost:3000/onboarding
4. Complete onboarding (select avatar + goals)
5. Should redirect to http://localhost:3000/dashboard
6. Dashboard should show mission card

---

## 📝 Development Workflow

### Making Code Changes

**Backend:**
1. Edit code in `backend/app/`
2. Server auto-reloads (Uvicorn in watch mode)
3. Test via API: `curl http://localhost:8000/api/...`

**Frontend:**
1. Edit code in `frontend/src/`
2. Browser auto-refreshes (Next.js HMR)
3. Check console for errors

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build    # Creates .next/ folder
npm run start    # Runs production server
```

**Backend:**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:8000 main:app  # Or deploy with Docker
```

---

## 🗂️ Project Structure Quick Reference

```
backend/
  ├── main.py              # FastAPI entry point
  ├── requirements.txt     # Dependencies
  └── app/
      ├── models/          # ORM definitions (User, Mission, etc.)
      ├── services/        # Business logic (OnboardingService, etc.)
      ├── schemas/         # Request/response validation
      ├── api/routes/      # Endpoint definitions
      └── core/            # Config and utilities

frontend/
  ├── src/
  │   ├── app/             # Pages (login, dashboard, onboarding, etc.)
  │   ├── components/      # Reusable React components
  │   ├── context/         # State management (StudentContext)
  │   └── lib/             # API client functions
  ├── package.json         # Dependencies (Next.js, Tailwind v4)
  └── tsconfig.json        # TypeScript configuration
```

---

## 🔌 API Base URL

All API calls should use:
```
http://localhost:8000
```

Example in frontend:
```typescript
const API_BASE = "http://localhost:8000";

// Then use in api.ts:
const response = await fetch(`${API_BASE}/api/student/1/progress`);
```

---

## 🎯 Common Development Tasks

### Add New API Endpoint
1. Create route in `backend/app/api/routes/`
2. Create service method in `backend/app/services/`
3. Register router in `backend/app/__init__.py`
4. Create client function in `frontend/src/lib/api.ts`
5. Use in React component

### Add New Page
1. Create directory in `frontend/src/app/[page-name]/`
2. Create `page.tsx` file
3. Add to navigation if needed
4. Test routing works

### Add New Component
1. Create file in `frontend/src/components/`
2. Make it a client component if needed: `"use client"`
3. Export and import where needed
4. Style with Tailwind CSS

### Debug Frontend
1. Open http://localhost:3000 in browser
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for API calls
5. Check Elements tab for HTML structure

### Debug Backend
1. Add print statements in Python files
2. Check terminal output when running `python main.py`
3. Test endpoints with curl or Postman
4. Check database with `psql -d edtech_mvp -c "SELECT * FROM users;"`

---

## 🚨 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`
```bash
pip install -r requirements.txt
```

**Error:** `connection refused` on port 8000
```bash
# Check if process is already using port
lsof -i :8000
# Kill it
kill -9 <PID>
```

**Error:** Database connection failed
```bash
# Check PostgreSQL is running
brew services list  # macOS
systemctl status postgresql  # Linux

# Check connection string in config.py
psql -U postgres -d edtech_mvp  # Test connection
```

### Frontend won't build

**Error:** `Unknown at rule @apply`
```bash
# Make sure Tailwind v4 is installed
npm list tailwindcss  # Should show v4.1.18+

# If not, reinstall
npm install -D tailwindcss@latest postcss autoprefixer
```

**Error:** TypeScript compilation errors
```bash
cd frontend
npm run build  # Shows detailed errors
# Fix errors in code and rebuild
```

**Error:** Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
npm run dev  # Try again
```

### API returning 404

**Issue:** Frontend calls `http://localhost:8000/onboarding/save` but should be `http://localhost:8000/api/onboarding/save`

**Solution:** Check URLs in `frontend/src/lib/api.ts` have `/api` prefix
```typescript
// ❌ Wrong
const url = `${API_BASE}/onboarding/save`;

// ✅ Correct
const url = `${API_BASE}/api/onboarding/save`;
```

---

## 📊 Performance Tips

**Frontend:**
- Use React.memo() for expensive components
- Implement code splitting with dynamic imports
- Cache API responses where appropriate
- Use next/image for image optimization

**Backend:**
- Add database indexes on frequently queried columns
- Use connection pooling for database
- Cache common queries
- Implement pagination for list endpoints

---

## 🔐 Security Checklist

Before deploying to production:
- [ ] Change all default passwords
- [ ] Set `DEBUG = False` in backend config
- [ ] Use environment variables for secrets
- [ ] Add HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use CORS properly
- [ ] Implement proper authentication
- [ ] Use secure session cookies
- [ ] Add logging and monitoring

---

## 📞 Getting Help

### Check These Files First
- `README.md` - Project overview
- `ARCHITECTURE.md` - How things fit together
- `API_ENDPOINTS.md` - Complete API reference
- `PROJECT_STATUS_&_ROADMAP.md` - Current status

### Check Server Output
- Frontend errors in browser console
- Backend errors in terminal where you ran `python main.py`
- Database errors in PostgreSQL logs

### Common Commands
```bash
# Backend
python main.py                    # Start server
curl http://localhost:8000/health # Health check

# Frontend
npm run dev                       # Start dev server
npm run build                     # Production build

# Database
psql -d edtech_mvp -c "\dt"      # List tables
psql -d edtech_mvp -c "SELECT * FROM users LIMIT 5;"  # View data
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] PostgreSQL running and database created
- [ ] Backend starts successfully on port 8000
- [ ] Frontend starts successfully on port 3000
- [ ] Health endpoints respond (curl http://localhost:8000/health)
- [ ] Can register new user via API
- [ ] Can register via UI (http://localhost:3000/register)
- [ ] Can complete onboarding
- [ ] Dashboard loads with stats and mission
- [ ] Quiz loads and questions display
- [ ] Missions can be created and completed

---

**Setup Complete!** 🎉

You're ready to start developing. See `ARCHITECTURE.md` for system overview and `API_ENDPOINTS.md` for complete API reference.

Last updated: December 25, 2025
