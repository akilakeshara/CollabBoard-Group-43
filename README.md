# CollabBoard (Group 43 Project)

A collaborative Kanban-style task board built with the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Infrastructure**: Docker + Docker Compose

## Repository Structure
- `/frontend`: React application organized into reusable components.
- `/backend`: Node.js Express REST API structured with routes, controllers, and models.

## Quick Start (Docker)

1. Make sure Docker is running on your machine.
2. Run the application:
   ```bash
   docker-compose up -d --build
   ```
3. Access the frontend at `http://localhost:3000` and backend at `http://localhost:5000`.

## Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```
