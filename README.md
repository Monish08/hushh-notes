# 🎓 Hushh-Notes – AI-Powered Campus Study Agent

Hushh-Notes is an AI-powered campus study assistant built under the Hushh ecosystem.  
It transforms raw academic notes into structured exam preparation with quizzes, summaries, and live leaderboards.

---

## 🚀 Live Demo

🌐 Frontend (Vercel)  
https://hushh-notes.vercel.app/

⚙️ Backend API (Render)  
https://hushh-notes.onrender.com

---

## 🧠 The Problem

Students don’t struggle with lack of content — they struggle with overload.

Before exams:
- Notes are scattered across PDFs
- No structured revision format
- No way to self-test efficiently
- Low motivation for consistent revision

Hushh-Notes converts passive notes into active competitive learning.

---

## 🔥 Features

### 📄 AI PDF Processing
- Upload digital study material
- Extracts text using backend parsing
- Generates structured exam-focused content

### 📝 Smart Quiz Generation
- 20 structured questions:
  - 12 MCQs
  - 8 Short-answer questions
- Difficulty balanced (Easy, Medium, Hard)
- Clean structured JSON output

### 📖 Exam Preparation Mode
- Concise AI-generated summary
- Most repeated concepts
- Likely exam questions

### 🏆 Live Classroom Leaderboard
- Real-time updates via Firestore
- One attempt per user
- Classroom-based competitive environment

### 📤 WhatsApp Share Loop
- Share quiz score instantly
- Invite classmates
- Built-in campus growth mechanism

### 📊 Admin Dashboard
- Total users
- Classrooms created
- Quiz attempts
- Active classroom metrics

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Firebase Authentication
- Firestore (Real-time DB)
- React Router DOM

### Backend
- Node.js
- Express
- Multer (File Upload)
- pdf-parse (Text Extraction)
- Mistral AI API
- Deployed on Render

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → Firebase

---

## 🔄 How It Works

1. User uploads a study PDF
2. Backend extracts text
3. AI generates structured exam-ready JSON
4. Data stored in Firestore
5. Quiz rendered in classroom
6. Scores update leaderboard in real-time
7. Students share results → new users join

---

## 🔐 Security & Controls

- One attempt per user (UID-based enforcement)
- Admin route restricted by email
- Backend file size limits
- AI JSON validation before database write
- Protected routes with authentication guards





## 📌 License

Built for educational and hackathon purposes.
