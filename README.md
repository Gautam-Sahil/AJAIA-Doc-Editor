# 📝 Ajaia Collaborative Workspace


**A Next‑Generation Full‑Stack Document Editor Platform**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)

<img width="1485" height="863" alt="ajaia-doc-editor-six vercel app_ (1)" src="https://github.com/user-attachments/assets/0d9eeeac-3f7b-401e-87f4-5de15f699417" />


**Ajaia Collaborative Workspace** is an enterprise‑grade full‑stack document editor built with the MERN stack. It enables teams to create, edit, share, and persist rich‑text documents with file attachments, role‑based sharing, and real‑time auto‑save – all wrapped in a premium glassmorphic UI.

Designed for productivity engineers, this platform demonstrates sound product judgment, full‑stack execution, and AI‑assisted development under tight delivery constraints.

## 🚀 Live Access
> **Frontend (Vercel):** [Live Editor Portal](https://ajaia-doc-editor-six.vercel.app/)  
> **Backend (API):** [Live REST API](https://ajaia-doc-editor-six.vercel.app/api)

---

## ⚡ Core Capabilities Matrix

The platform delivers a cohesive document workflow, partitioned into intuitive surfaces for creation, editing, sharing, and administration.

| Module | 👤 User Experience | 🔐 Technical Implementation |
| :--- | :--- | :--- |
| **Document Canvas** | Create, rename, and edit documents with rich formatting (bold, italic, underline, headings, lists). | TipTap headless editor + React state; auto‑save via custom `useDebounce` hook. |
| **File Ingestion** | Import `.txt`, `.md`, or `.docx` files – content inserts directly into the current cursor position. | Client‑side parsing with HTML5 FileReader and `mammoth.js` for Word documents. |
| **Attachments** | Attach any file (stored as Base64) with options to view, download, or remove. | Secondary asset engine embedded in MongoDB documents. |
| **Sharing & Access** | Share documents via email with role‑based permissions (viewer / editor). | JWT authentication + Express middleware; `sharedWith` array on document model. |
| **Persistence** | All content and attachments survive page refresh; state is preserved in MongoDB Atlas. | Mongoose ODM with automatic timestamps and version tracking. |
| **Export** | Export documents as Markdown (`.md`) or print to PDF. | Client‑side blob generation and `window.print()` integration. |

---

## 🔐 Role‑Based Access Control

The system uses **two primary roles** with clear permission boundaries:

| Role | Access | Key Permissions |
| :--- | :--- | :--- |
| **Owner** | Full dashboard | Create, edit, delete, share, and manage all owned documents. |
| **Collaborator** | Shared documents only | View or edit documents (based on assigned permission) – no deletion or sharing rights. |

All route and API endpoints enforce these permissions via JWT middleware and document‑level ownership checks.

---

## 🏗️ Technical Architecture & Workflows

### 1. Concurrent Data Orchestration
To minimise load times, the dashboard uses `Promise.all()` to fetch owned and shared documents concurrently. Skeleton loaders provide visual feedback while data streams resolve.

### 2. Auto‑Save Engine
- User keystrokes trigger a 1500ms debounce timer.
- When typing pauses, a background `PUT` request persists the document.
- A manual **Save Canvas** button offers checkpoint control with timestamp feedback.

### 3. File Processing Pipeline
- **TXT/MD:** Read as UTF‑8 text and converted to HTML paragraphs.
- **DOCX:** Parsed via `mammoth.js` to semantic HTML.
- **Attachments:** Binary files are Base64‑encoded and stored directly in the document record – no external storage required.

### 4. Sharing Workflow
- Owner enters a collaborator's email and selects permission level.
- Backend validates user existence and updates the document's `sharedWith` array.
- Dashboard dynamically separates **Owned** and **Shared** documents for clear visibility.

---

## 💻 Tech Stack Deep Dive

### Client‑Side (Frontend)
- **Core:** React 19 + Vite (fast HMR)
- **Architecture:** Component‑driven, custom hooks (`useDebounce`), context API for authentication
- **Styling:** Tailwind CSS + custom dark glassmorphic design tokens
- **Editor:** TipTap (headless rich‑text editor with extensions)
- **Icons:** Lucide React

### Server‑Side (Backend)
- **Core:** Node.js & Express.js
- **Database:** MongoDB Atlas with Mongoose ODM
- **Security:** JWT authentication, bcryptjs hashing, CORS, environment variable protection
- **Testing:** Jest + Supertest (integration tests for API endpoints)

---

## ⚙️ Installation & Development

Run this platform on your local machine using the following steps:

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ajaia-doc-editor.git
cd ajaia-doc-editor<img width="1485" height="863" alt="ajaia-doc-editor-six vercel app_ (1)" src="https://github.com/user-attachments/assets/af034137-e466-470d-8f31-fbff1731c0e2" />
```

**2. Configure the Backend**

```bash
cd server
npm install
Create a .env file in the server directory:

env
PORT=5000
MONGO_URI=your_mongodb_cluster_connection_string
JWT_SECRET=your_secure_signature
Boot the API:

bash
npm run dev
```
**3. Configure the Frontend**
```bash
Open a new terminal at the project root:


cd client
npm install
Create a .env file in the client directory (optional – defaults to http://localhost:5000):

env
VITE_API_URL=http://localhost:5000
Start the Vite development server:

bash
npm run dev
```
**4. Run Tests**

```bash
cd server
npm test
```


Developed with ❤️ by Sahil Tiwari
