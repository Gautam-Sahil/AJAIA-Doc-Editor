### 3. `ARCHITECTURE.md`
This document highlights your product intuition and explains *why* you built things the way you did.

```markdown
# Workspace Architectural Review & Structural Tradeoffs

## 🏛️ Foundational System Blueprint
The application operates on a cleanly decoupled, service-oriented Model-View-Controller (MVC) topology. 

Rather than deploying a monolithic setup, the frontend SPA viewports communicate asynchronously with the REST API pipeline via a customized Axios layer running interceptor handlers. This mirrors high-scale enterprise environments where client execution engines remain separate from persistent storage databases.

### Key Choice: React 19 SPA + Express API Router
- **Decoupled Velocity:** Splitting the system into independent client and server micro-directories ensures modular deployment mechanics (e.g., Vercel for instant frontend rendering edge-caches and Render/AWS for processing isolated API threads).
- **Mongoose Data Relational Layout:** Standard document states scale optimally within unstructured JSON topologies. MongoDB stores rich text HTML fragments effortlessly compared to strict relational tabular schemas, which require expensive text block normalization operations.

---

## 🔄 Core Engineering Priorities & Implementation Deep-dive

### 1. Custom Debounce Synchronization Network Layer
To minimize heavy database compute strain, saving transactions run on a hybrid worker setup. 
- State variations trigger an isolated client hooks observer `useDebounce.js` tracking change loops across a 1500ms timebox. 
- When typing stops, background network requests fire silently without freezing the interface. 
- **Manual Redundancy:** A prominent **Save Canvas** command controller is anchored in the center-right view panel, giving users manual control over cloud sync checkpoints and displaying the exact timestamp of the last successful save.

### 2. Comprehensive 3-Way File Processing Engine
- **Content Insertion:** Rather than using basic replacement code that overwrites active drafts, text files run through an append loop.
- **Word Document Processing (.docx):** Client-side compilation via `mammoth.js` turns raw binary formatting structures into standardized semantic HTML markup without adding external microservice servers.
- **Base64 Attachment Isolation:** Associated asset binaries transform into clean data-string arrays embedded inside the parent document. This approach avoids heavy S3 cloud container dependencies while fulfilling the assignment parameters.

### 3. Granular Access Control and Identity Enforcement
Documents are locked down behind custom Express middleware routing guards (`protect`). JWT tokens parsed from request authorization headers decrypt user session details on the fly. 
- Document models maintain strict arrays mapping collaborative boundaries (`sharedWith`). 
- Mutating actions (`PUT`) explicitly match user object permissions to verify writing authority before executing updates, gracefully protecting documents from unauthorized overrides.

---

## ⚡ Future Scale Horizons (What to Build Next)
Given an extra 2–4 hours of architecture development, engineering focus would adapt to the following vectors:
1. **True Real-time Operations via WebSockets / CRDTs:** Upgrade the mock visual presence trackers to live operational sync engines using **Yjs** and socket layers to stream remote cursor positioning inputs.
2. **Optimistic Database Mutations:** Cache local structural variations via IndexedDB memory layers to allow users to continue editing offline during network dropouts, sync-stamping changes the moment connectivity resumes.