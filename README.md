<div align="center">
  <h1>🚀 HackDesk</h1>
  <p><strong>An Intelligent, Concurrency-Proof Hackathon Management Platform</strong></p>

  ![Next JS](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
</div>

---

**HackDesk** is a high-performance event management system designed to seamlessly handle large-scale hackathons. It features a robust registration and check-in system, alongside a unique **AI-powered Hackathon Idea Generator** equipped with **atomic locking** to prevent race conditions during high-traffic claim events.

Built with modern web technologies to ensure low latency, high availability, and a premium user experience.

---

## ✨ Key Features

### 👥 Smart Registration & Attendance
* **Bulk Import:** Seamlessly import participants via CSV parsing.
* **Manual Add:** Easily add late or on-the-spot attendees directly from the dashboard.
* **Active Sessions:** Track attendance dynamically using Session names (e.g., "Day 1", "Day 2") for accurate multi-day check-ins.

### 🧠 AI-Powered Idea Pool (Pre-generation Architecture)
* **Smart Batches:** Organizers can generate batches of beginner-friendly project ideas based on specific themes using the **Groq AI API**.
* **Zero Delay:** Pre-generating ideas prevents API rate limits and keeps the end-user experience lightning fast without any generation wait times.

### 🔒 Concurrency-Proof Idea Claiming
* **Atomic Transactions:** Engineered with direct database locks.
* **Race-Condition Proof:** If 100 students click "Generate" at the exact same millisecond, the PostgreSQL backend uses strict isolation and row-level locking to ensure **one unique idea is assigned per student**. Zero duplicate claims.

### 📊 Admin Dashboard
* **Intuitive UI:** Clean, modern interface for event organizers to manage themes, monitor the idea pool, and export attendance data effortlessly.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL) with Row Level Security (RLS)
* **AI Engine:** [Groq API](https://groq.com/) (Fast LLM Inference)

---

## 🚦 Getting Started

### Prerequisites
Make sure you have `Node.js` installed on your machine. You will also need active **Supabase** and **Groq API** accounts.

### 1. Clone the repository
```bash
git clone [https://github.com/CodeWithMehru/Hackathon-Management.git](https://github.com/CodeWithMehru/Hackathon-Management.git)
cd Hackathon-Management

2. Install dependencies
Bash

npm install

3. Set up Environment Variables

Create a .env.local file in the root directory and add the following keys securely:
Code snippet

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key

4. Run the Development Server
Bash

npm run dev

Open http://localhost:3000 with your browser to see the result.
🗄️ Database Schema

This project relies on specific tables in Supabase:

    Hackathon_Attendance: Manages attendee data, sessions, and check-in status.

    Theme_Ideas: Stores AI-generated ideas, tracking the is_claimed boolean status to enable atomic locking.

👨‍💻 Author

Built by CodeWithMehru