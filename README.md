# 🛠️ Bighil - Anonymous Complaint Management System

Bighil is a secure, full-stack web application for anonymously submitting, managing, and resolving complaints. It includes real-time notifications, role-based access control, and a clean UI powered by modern technologies like Next.js, React, TailwindCSS, and a Node,Express backend.
---
## 🚀 Setup Instructions

### 1. Clone the Repository
git clone https://github.com/vijayakumar1069/bighil_client.git

### 2. Install Dependencies
npm install

### 3. Run the App
npm run dev

### ⚙️ Local vs Production Config
Create a .env.local file in root:

    NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
    NEXT_PUBLIC_PRODUCTION_BACKEND_URL=https://new-bighil-server.onrender.com
    CLIENT_DEV_URL=http://localhost:3000
    CLIENT_PROD_URL=https://bighilclient.vercel.app
    NEXT_PUBLIC_NODE_DEV=development




In production, set these environment variables on:
Vercel for the frontend


### 👥 Role Definitions
### 🧑 User
  1.Can submit complaints anonymously.
  2.Receives notifications when complaints are updated or resolved.
  3.Can view only their own complaints and responses.
### 🏢 Client (Company)
There are three roles under the client (company) category:

🔹 SUPER ADMIN
✅ Can view all complaints submitted against their company.
✅ Can update complaint status (e.g., In Progress / Resolved).
✅ Can chat with users.
✅ Can chat with internal admins (notes).
✅ Receives real-time alerts for new complaints.
🔹 ADMIN
✅ Can view all complaints submitted against their company.
✅ Can update complaint status.
✅ Can chat with users.
✅ Can chat with internal admins (notes).
✅ Receives real-time alerts for new complaints.
🔹 SUB ADMIN
✅ Can view complaints submitted against their company.
❌ Cannot update complaint status.
❌ Cannot chat with users.
✅ Can chat internally with admins (notes).
✅ Receives real-time alerts for new complaints.

### 👮bighil Admin
  1.Has full access to all data and complaints.

### 📬 Notifications (Real-time)
  1.Uses Socket.io for real-time events.
  2.Users and Clients get live updates when complaints are added/updated.
  3.Admins get private updates when internal notes are added.

### 🛠️ Tech Stack
⚙️ Backend
Node.js – JavaScript runtime
Express.js – Backend framework
MongoDB – NoSQL database
Socket.io – Real-time communication
JSON Web Token (JWT) – Authentication
EJS – Server-side email templating
Cloudinary – File/image uploads and storage
🌐 Frontend
Next.js – React framework with App Router
Tailwind CSS – Utility-first CSS framework
ShadCN UI – Component library
Framer Motion – Animations
🔄 Deployment
Frontend: Deployed on Vercel
Backend: Deployed on Render
🧪 CI/CD
GitHub Actions – Continuous integration and deployment workflows


