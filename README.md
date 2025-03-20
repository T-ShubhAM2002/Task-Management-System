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

### Backend
Create two environment files: `.env` for development and `.env.production` for production.

#### Development (.env)
```
# Server Configuration
NODE_ENV=development
PORT=4001

# MongoDB Configuration
MONGODB_URI=your_mongodb_uri

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=csv,xlsx,xls
```

#### Production (.env.production)
```
# Server Configuration
NODE_ENV=production
PORT=4001

# MongoDB Configuration
MONGODB_URI=your_production_mongodb_uri

# JWT Configuration
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=csv,xlsx,xls
```

### Frontend
Create two environment files: `.env` for development and `.env.production` for production.

#### Development (.env)
```
VITE_API_URL=http://localhost:4001/api
```

#### Production (.env.production)
```
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=Task Management System
VITE_APP_VERSION=1.0.0
```

## Deployment

### Backend Deployment (on Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Copy from `.env.production`
4. Deploy the service

### Frontend Deployment (on Render/Vercel)

1. Create a new Web Service/Static Site
2. Connect your GitHub repository
3. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Copy from `.env.production`
4. Deploy the service

### Important Deployment Notes

1. **Environment Variables**: 
   - Ensure all environment variables are properly set in your deployment platform
   - Update `CORS_ORIGIN` in backend to match your frontend domain
   - Update `VITE_API_URL` in frontend to match your backend domain

2. **MongoDB Atlas**:
   - Ensure your IP whitelist includes your deployment platform's IPs
   - Use a strong password and keep it secure
   - Configure network access appropriately

3. **Security**:
   - Use strong JWT secrets in production
   - Enable HTTPS
   - Set up proper CORS configuration
   - Configure rate limiting according to your needs

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