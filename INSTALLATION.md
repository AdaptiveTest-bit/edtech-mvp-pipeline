# 🔧 Installation & Setup Guide

Complete guide to setting up and running the EdTech MVP locally.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Python 3.9+** → [Download](https://www.python.org/downloads/)
- **Node.js 18+** → [Download](https://nodejs.org/)
- **PostgreSQL 12+** → [Download](https://www.postgresql.org/download/)
- **Git** → [Download](https://git-scm.com/)

**Verify installations:**

```bash
python --version      # Should be 3.9+
node --version        # Should be 18+
npm --version         # Should be 9+
psql --version        # Should be 12+
```

---

## 🗄️ Step 1: Database Setup

### 1.1 Create Database

```bash
createdb edtech_mvp
```

### 1.2 Run DDL Scripts (In Order!)

```bash
cd database/DDL

# Create schemas and tables
psql -U postgres -d edtech_mvp -f 00_users.sql
psql -U postgres -d edtech_mvp -f 01_curriculum.sql
psql -U postgres -d edtech_mvp -f 02_analytics.sql
psql -U postgres -d edtech_mvp -f 03_quiz_submissions.sql
psql -U postgres -d edtech_mvp -f 04_student_progress.sql
psql -U postgres -d edtech_mvp -f 05_indexes.sql
```

### 1.3 Load Sample Data

```bash
cd ../DML

# Load chapters, concepts, students
psql -U postgres -d edtech_mvp -f 01_sample_data.sql

# Load 33 sample questions
psql -U postgres -d edtech_mvp -f sample-questions.sql
```

### 1.4 Verify Database

```bash
psql -U postgres -d edtech_mvp -c "SELECT COUNT(*) FROM users.students;"
```

Expected output: `5` (5 sample students)

---

## 🐍 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Create Python Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate venv
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected packages:**
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- pydantic
- python-jose
- bcrypt
- passlib

### 2.4 Update Database URL (if needed)

Edit `backend/app/core/config.py`:

```python
# Default is:
DATABASE_URL = "postgresql://postgres:password@localhost/edtech_mvp"

# Change if your PostgreSQL setup is different:
DATABASE_URL = "postgresql://[user]:[password]@[host]/edtech_mvp"
```

### 2.5 Start Backend Server

```bash
python main.py
```

**Expected output:**

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### 2.6 Verify Backend

Open in browser or terminal:

```bash
# Check API health
curl http://localhost:8000/docs

# Should return Swagger UI ✅
```

---

## 🎨 Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure API URL (if needed)

Check `frontend/lib/api.ts`:

```typescript
// Default is:
const API_BASE_URL = 'http://localhost:8000';

// Change if backend is hosted elsewhere
```

### 3.4 Start Frontend Development Server

```bash
npm run dev
```

**Expected output:**

```
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 1051ms
```

### 3.5 Verify Frontend

Open in browser:

```
http://localhost:3000
```

Should see home page with "Register" and "Login" buttons ✅

---

## ✅ Verification Checklist

### Backend (Port 8000)

- [ ] `python main.py` runs without errors
- [ ] `http://localhost:8000/docs` shows Swagger UI
- [ ] Database connection works (check logs)
- [ ] Can curl: `curl http://localhost:8000/api/auth/login`

### Frontend (Port 3000)

- [ ] `npm run dev` compiles successfully
- [ ] `http://localhost:3000` loads in browser
- [ ] No console errors (open DevTools)
- [ ] Navbar appears at top of page

### Database

- [ ] `psql -U postgres -d edtech_mvp` connects
- [ ] `SELECT COUNT(*) FROM users.students;` returns `5`
- [ ] `SELECT COUNT(*) FROM curriculum.questions;` returns `33`

---

## 🧪 Step 4: Test the Setup

### 4.1 Test Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

Expected: `201 Created` response with user ID ✅

### 4.2 Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

Expected: `200 OK` response with JWT token ✅

### 4.3 Test Quiz Endpoint

```bash
TOKEN="<paste_token_here>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/quiz/random/1
```

Expected: `200 OK` response with question ✅

### 4.4 Test Frontend Login

1. Open `http://localhost:3000`
2. Click "Login"
3. Enter: `alice@example.com` / `password123`
4. Should redirect to `/dashboard` ✅

---

## 🚀 Both Servers Running

Once verified, you should have:

**Terminal 1 (Backend):**
```
$ python main.py
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 (Frontend):**
```
$ npm run dev
✓ Ready in 1051ms
```

**Sample Accounts to Test:**

| Email | Password |
|-------|----------|
| alice@example.com | password123 |
| bob@example.com | password123 |
| charlie@example.com | password123 |
| diana@example.com | password123 |
| eve@example.com | password123 |

---

## 🛠️ Troubleshooting

### Backend Issues

**Error: `psycopg2.OperationalError`**
```
Problem: Database connection failed
Solution: Check DATABASE_URL in app/core/config.py
Solution: Verify PostgreSQL is running: brew services start postgresql
```

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```
Problem: Dependencies not installed
Solution: Run: pip install -r requirements.txt
Solution: Ensure venv is activated
```

**Error: `Address already in use` (Port 8000)**
```
Problem: Another process using port 8000
Solution: Kill process: lsof -ti:8000 | xargs kill -9
Solution: Or use different port: uvicorn app.main:app --port 8001
```

### Frontend Issues

**Error: `npm: command not found`**
```
Problem: Node.js not installed
Solution: Download from https://nodejs.org/
```

**Error: `Could not find a declaration file for module`**
```
Problem: TypeScript definitions missing
Solution: Run: npm install
Solution: Rebuild: npm run build
```

**Error: `connect ECONNREFUSED 127.0.0.1:8000`**
```
Problem: Backend not running
Solution: Ensure backend server is running on port 8000
```

### Database Issues

**Error: `database "edtech_mvp" does not exist`**
```
Problem: Database not created
Solution: Run: createdb edtech_mvp
```

**Error: `relation "students" does not exist`**
```
Problem: DDL scripts not run
Solution: Run DDL files in order (00-05)
```

---

## 📁 Project Structure

```
edtech-mvp-pipeline/
├── backend/
│   ├── main.py                 # Entry point
│   ├── requirements.txt        # Python dependencies
│   ├── app/
│   │   ├── core/config.py     # Database config
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic models
│   │   ├── services/          # Business logic
│   │   └── api/routes/        # API endpoints
│   └── venv/                  # Virtual environment
│
├── frontend/
│   ├── package.json           # Node dependencies
│   ├── next.config.ts         # Next.js config
│   ├── src/
│   │   ├── app/              # Pages (routing)
│   │   ├── components/       # React components
│   │   ├── context/          # React Context
│   │   └── lib/api.ts        # API client
│   ├── public/               # Static assets
│   └── node_modules/         # Node packages
│
├── database/
│   ├── DDL/                  # Schema creation
│   └── DML/                  # Sample data
│
└── Documentation files (README, ARCHITECTURE, etc.)
```

---

## 🔒 Environment Variables (Production)

For production deployment, create `.env` files:

**Backend `.env`:**
```
DATABASE_URL=postgresql://user:pass@host/edtech_mvp
JWT_SECRET=your-super-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRY_DAYS=30
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design overview
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation
- **[DATABASE.md](DATABASE.md)** - Database schema details
- **[FEATURES.md](FEATURES.md)** - What's built in Phase 1-4

---

## 🆘 Support

If you encounter issues:

1. Check **Troubleshooting** section above
2. Review relevant documentation
3. Check backend logs (Terminal 1)
4. Check frontend console (Browser DevTools)
5. Verify all services are running (ports 3000, 8000)

---

**Last Updated:** January 2024  
**Version:** 1.0 - Production Ready
