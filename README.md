
---

# Devfolio Sync

Devfolio Sync is a full-stack system that automates the curation of developer portfolio projects from GitHub.
It fetches project repositories, summarizes their README files using an AI summarization microservice, stores project metadata and summaries in a JSON file, and keeps a target portfolio repository up-to-date via automated commits.

It also includes a Next.js Admin Dashboard for managing projects, summaries, and users, with JWT-based authentication and secure API routes.

## Overview

Devfolio Sync helps developers keep their personal portfolio websites or repos synchronized with their latest GitHub projects. It intelligently summarizes each project’s README and maintains clean, structured metadata.

### Core Features
- AI Summarization: Uses a FastAPI-based summarizer microservice (powered by a Hugging Face model) to generate concise summaries.
- Automated Sync: Fetches projects periodically (via a scheduled weekly job) or when triggered by a GitHub webhook.
- Persistent Metadata: Stores all project data and summaries in a single JSON file within the portfolio repo.
- Admin Dashboard: Allows admins to view, edit, and re-curate project summaries and manage team members.
- Authentication: JWT-based authentication for secure access to the admin interface and protected API routes.
- Deployment Ready: Backend hosted on Render; Frontend on Vercel.

## System Architecture

![Devfolio Sync Architecture](./public/architecture.png)

## Tech Stack
- Backend: Node.js, Express, TypeScript
- AI Summarizer: FastAPI, Hugging Face Inference API
- Frontend: Next.js 14, Tailwind CSS, Shadcn UI, JWT Auth
- Database: MongoDB
- Scheduling: Node-cron
- Icons: Lucide React
- Logging: Winston
- Deployment: Vercel + Render
- Testing: Jest +  Supertest

## Local Setup

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9
- GitHub Personal Access Token
- npm

### Backend Setup
```bash
git clone https://github.com/Tshergzeh/devfolio-sync.git
cd devfolio-sync
cp env.txt .env
npm install
npm run dev
```

### Summarizer Setup
```bash
cd ai-summarizer
pip install -r requirements.txt
uvicorn summarizer_service:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup
```bash
git clone https://github.com/Tshergzeh/devfolio-sync-frontend.git
cd devfolio-sync-frontend
cp env.txt .env.local
npm install
npm run dev

---
