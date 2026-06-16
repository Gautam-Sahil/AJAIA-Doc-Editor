# Ajaia Collaborative Workspace Platform

An enterprise-grade, high-performance web document workspace crafted with the MERN stack (MongoDB, Express, React 19, Node.js). Features custom background auto-saving threads, multi-format ingestion loops, role-based sharing permissions, and a premium dark glassmorphic interface context layer.

## 🚀 Quick Setup and Reproduction Run-guide

### Prerequisites
- Node.js (v18.x or greater recommended)
- A running MongoDB instance or connection URI string

---

### 1. Server API Architecture Deployment
Navigate into the backend subsystem root directory to instantiate local service layers:
```bash
cd server
npm install

Create an environmental security control configuration vault named .env in the root of the /server folder:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=ajaia_super_secret_key_2026
Launch the continuous development server instance via nodemon:

Bash
npm run dev
To run the automated endpoint validation test suites:

Bash
npm test
2. Client Application Interface Deployment
Open a decoupled terminal tab back at the root workspace workspace folder and head into the frontend cluster configuration space:

Bash
cd client
npm install
Launch the optimization compilation dev environment:

Bash
npm run dev
Open your browser canvas channel immediately at http://localhost:5173.

🛠️ Key Architectural Ingestion Specs
File Ingestions: Accepts .txt, .md, and .docx parameters. Importing files inserts content safely at the current cursor cross-hairs to preserve active draft data pipelines.

Attachments System: Secondary files uploaded through the structural workspace view sidebar transform directly into Base64 string packages embedded inside the MongoDB document layer. Click any file node item block to trigger an automatic localized data rebuild download.

Sharing Configurations: Seed two unique user accounts locally through the interface. Sharing via email transfers reading (viewer) or modifying (editor) security flags instantly.