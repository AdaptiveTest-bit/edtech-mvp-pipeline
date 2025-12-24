# 🎓 EdTech MVP - Production Ready

A complete learning platform with **Leitner Box spaced repetition** + **EMA mastery tracking** for adaptive learning.

---

## ✨ Key Features

### **Backend (✅ Production Ready)**
- ✅ FastAPI with async support
- ✅ PostgreSQL with 11 optimized tables
- ✅ EMA-based mastery calculation (0.0-1.0)
- ✅ Leitner box spaced repetition (4 levels)
- ✅ Automatic XP & streak tracking
- ✅ Chapter-level progress monitoring
- ✅ 8 fully functional API endpoints

### **Frontend (🟡 Integration Ready)**
- ✅ Quiz arena UI with feedback
- ✅ Next.js 16 + TypeScript
- ✅ Tailwind CSS styling
- 📝 Ready for API integration
- 📝 Ready for dashboard build

### **Database (✅ Complete)**
- ✅ 3 schemas: users, curriculum, analytics
- ✅ Composite keys & UUID support
- ✅ Cascade delete relationships
- ✅ 140+ sample data rows
- ✅ Performance indexes

---

## 🚀 Quick Start

### **Step 1: Backend Setup**
```bash
# Setup database
createdb edtech_mvp

# Run DDL files (in order!)
cd database/DDL
psql -U postgres -d edtech_mvp -f 00_users.sql
psql -U postgres -d edtech_mvp -f 01_curriculum.sql
psql -U postgres -d edtech_mvp -f 02_analytics.sql
psql -U postgres -d edtech_mvp -f 03_quiz_submissions.sql
psql -U postgres -d edtech_mvp -f 04_student_progress.sql
psql -U postgres -d edtech_mvp -f 05_indexes.sql

# Insert sample data
cd ../DML
psql -U postgres -d edtech_mvp -f 01_sample_data.sql
```

### **Step 2: Start Backend**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python main.py
# ✅ Uvicorn running on http://0.0.0.0:8000
```

### **Step 3: Start Frontend**
```bash
cd frontend
npm install
npm run dev
# ✅ Local: http://localhost:3000
```

### **Step 4: Test**
```bash
# Backend health
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs
```

---

## 📊 Backend Endpoints (8 Total)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/auth/register/student` | POST | Register student |
| `/api/auth/login` | POST | Login |
| `/api/quiz/question/{id}` | GET | Get question |
| `/api/quiz/random/{concept_id}` | GET | Random question |
| `/api/quiz/submit` | POST | Submit answer + update mastery |
| `/api/student/{id}/progress` | GET | Chapter progress |
| `/api/student/{id}/streak` | GET | Streak info |

---

## 📚 Documentation

1. **SETUP_AND_TESTING.md** - Setup & testing guide
2. **MVP_STATUS.md** - Feature checklist & status
3. **FRONTEND_INTEGRATION_PLAN.md** - Frontend integration steps

---

## 📁 Structure

```
edtech-mvp-pipeline/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── app/models/ (12 ORM classes)
│   ├── app/services/ (business logic)
│   └── app/api/routes/ (8 endpoints)
├── frontend/
│   ├── src/app/ (Next.js pages)
│   ├── src/components/ (React components)
│   └── src/lib/ (API client - TO BUILD)
├── database/
│   ├── DDL/ (5 schema files)
│   └── DML/ (sample data)
└── README.md, SETUP_AND_TESTING.md, MVP_STATUS.md
```

---

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend | ✅ COMPLETE | All 8 endpoints working |
| Database | ✅ COMPLETE | 11 tables, sample data |
| Quiz UI | ✅ BUILT | Hardcoded (ready for API) |
| API Integration | 📝 READY | See FRONTEND_INTEGRATION_PLAN.md |
| Auth Pages | 📝 READY | Templates provided |
| Dashboard | 📝 READY | Template provided |

---

## 🔄 Next: Frontend Integration

**See FRONTEND_INTEGRATION_PLAN.md for:**
- API client code
- State management setup
- Auth pages templates
- Dashboard templates
- Step-by-step instructions

**Estimated time:** 6-8 hours to full MVP

---

## 🧠 Mastery Algorithm

### **Leitner Box (4 Levels)**
- Level 1: Review every 1 day
- Level 2: Review every 3 days
- Level 3: Review every 7 days
- Level 4: Review every 21 days (mastered)

### **EMA Mastery Score (0.0-1.0)**
```
new_score = α × correct + (1 - α) × previous
where α = 2 / (N + 1)
```

### **XP System**
- Correct: +10 XP
- Time bonus: +5 XP (faster)
- Streak: +5 XP per day

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-------------|
| Backend | FastAPI + SQLAlchemy 2.0 |
| Frontend | Next.js 16 + React 19 + TypeScript |
| Database | PostgreSQL 13+ |
| Validation | Pydantic v2 |
| Styling | Tailwind CSS |
| Server | Uvicorn |

---

## ✅ Production Ready

- ✅ Backend fully tested
- ✅ Database optimized with indexes
- ✅ All models DDL-synced
- ✅ CORS enabled
- ✅ Error handling implemented

---

**Status:** Backend ✅ | Frontend Integration 🟡  
**Updated:** 24 December 2025  
**Version:** 1.0.0 MVP
