<div align="center">
  <img src="frontend/src/assets/hero.png" alt="CollabBoard Logo" width="300" />
  
  # 📋 CollabBoard
  
  **A Real-time Collaborative Kanban Task Board**  
  *Built by Group 43*

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

</div>

---

## ✨ Features

- **Real-time Collaboration:** Instant updates across all connected clients using WebSockets (`Socket.io`).
- **Kanban Methodology:** Organize tasks into customizable columns (e.g., To Do, In Progress, Done).
- **Drag and Drop:** Intuitive drag-and-drop interface for moving tasks between statuses.
- **User Authentication:** Secure JWT-based registration and login system.
- **Responsive Design:** A beautiful, modern interface that works flawlessly on both desktop and mobile.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Bootstrapped with Vite)
- **Styling:** Custom CSS with a modern UI approach
- **State Management:** React Context API & Custom Hooks

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Real-time Engine:** Socket.io
- **Security:** `bcryptjs` for password hashing, `jsonwebtoken` for auth

---

## 📁 Repository Structure

```text
CollabBoard-Group-43/
├── frontend/          # React application (Vite)
│   ├── src/           # Components, Pages, Context, Hooks, Styles
│   └── public/        # Static assets
└── backend/           # Node.js Express REST API
    ├── src/
    │   ├── models/    # Mongoose schemas (User, Board, etc.)
    │   ├── routes/    # Express API routes
    │   ├── controllers/# Business logic
    │   └── server.js  # Entry point & Socket.io setup
    └── .env           # Environment variables
```

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/akilakeshara/CollabBoard-Group-43.git
cd CollabBoard-Group-43
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
```
*The backend will run on `http://localhost:5001`*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`*

---

## 🐳 Quick Start (Docker)
If you prefer running the app via Docker without manual setup:

1. Ensure Docker and Docker Compose are installed.
2. Run the application from the root directory:
   ```bash
   docker-compose up -d --build
   ```
3. Access the application:
   - **Frontend:** `http://localhost:5173`
   - **Backend API:** `http://localhost:5001`

*(Note: Ensure your `docker-compose.yml` reflects the correct ports if using Docker)*

---

<div align="center">
  <i>Developed with ❤️ by Group 43</i>
</div>
