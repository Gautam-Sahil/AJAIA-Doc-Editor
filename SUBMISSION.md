# Ajaia Full Stack Product Engineer - Submission

**Candidate:** Sahil Tiwari  
**Email:** sahiltiwari0077@gmail.com  
**Role:** AI-Native Full Stack Product Engineer  

---

## 📦 Submission Package Contents

### 1. Source Code
- **Frontend:** React 19 + Vite + Tailwind CSS + TipTap
- **Backend:** Node.js + Express + MongoDB + Mongoose
- **Location:** Included in the Google Drive folder

### 2. Documentation
- `README.md` - Setup and run instructions
- `ARCHITECTURE.md` - System design and tradeoffs
- `AI_WORKFLOW.md` - AI usage transparency log
- `SUBMISSION.md` - This file

### 3. Live Deployment
- **Frontend:** https://ajaia-doc-editor-six.vercel.app/
- **API:** https://ajaia-doc-editor-six.vercel.app/api/documents

### 4. Test Credentials
| Email | Password | 
|-------|----------|------|
| sahiltiwari0077@gmail.com | sahiltiwari 
| partner@gmail.com | partner 

---

## ✅ Feature Completion Status

| Feature | Status | Notes |
|---------|--------|-------|
| Document Creation | ✅ Complete | Create new docs from dashboard |
| Document Renaming | ✅ Complete | Inline title editing |
| Rich Text Editing | ✅ Complete | Bold, Italic, Underline, Headings, Lists |
| Auto-Save | ✅ Complete | Debounced with visual feedback |
| Manual Save | ✅ Complete | Save Canvas button with timestamp |
| File Upload (Import) | ✅ Complete | .txt, .md, .docx support |
| File Attachments | ✅ Complete | View, Download, Remove |
| Document Sharing | ✅ Complete | Role-based (viewer/editor) |
| Document Persistence | ✅ Complete | MongoDB Atlas |
| User Authentication | ✅ Complete | JWT with seeded users |
| Document Dashboard | ✅ Complete | Owned vs Shared separation |
| Export | ✅ Complete | Markdown (.md) and PDF |
| Testing | ✅ Complete | Jest + Supertest integration |

---


## ⏭️ What I Would Build Next (2-4 hours)

1. **Real-time Collaboration** - WebSocket + Yjs for live cursors
2. **Document Version History** - Track changes and restore
3. **Export Enhancements** - PDF with proper formatting
4. **Document Templates** - Pre-built templates
5. **Improved File Handling** - Drag-and-drop upload

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
```bash
cd server
npm install
# Create .env file with MONGO_URI and JWT_SECRET
npm run dev

### Frontend Setup
```bash
cd client
npm install
npm run dev

### Running Tests
```bash
cd server
npm test