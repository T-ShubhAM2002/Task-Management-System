# Task Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for managing and distributing tasks among agents. The system provides a secure, user-friendly interface for task management with features like user authentication, task distribution, and real-time statistics.

## Features

- **User Authentication**
  - Secure login and signup system
  - JWT-based authentication
  - Protected routes and API endpoints

- **Agent Management**
  - Create, update, and delete agents
  - View agent workload statistics
  - Active/Inactive agent status

- **Task Management**
  - Upload tasks via CSV/Excel files
  - Automatic task distribution among agents
  - Task status tracking (pending, in-progress, completed, failed)
  - Task reassignment capabilities

- **Dashboard**
  - Real-time statistics
  - Task distribution visualization
  - Agent performance metrics

- **Security Features**
  - Rate limiting
  - Request compression
  - Security headers (Helmet)
  - CORS protection

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Express Rate Limit
- Helmet for security
- Compression

### Frontend
- React.js
- Material-UI
- React Router
- Axios
- React Toastify
- Chart.js

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

1. **Backend Deployment**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   npm run build
   ```

## API Documentation

### Authentication Endpoints
- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Login user

### Agent Endpoints
- GET /api/agents - Get all agents
- POST /api/agents - Create new agent
- PUT /api/agents/:id - Update agent
- DELETE /api/agents/:id - Delete agent

### Task Endpoints
- POST /api/tasks/upload - Upload tasks
- GET /api/tasks - Get all tasks
- PUT /api/tasks/:id/status - Update task status
- DELETE /api/tasks/:id - Delete task

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email your-email@example.com or create an issue in the repository. 