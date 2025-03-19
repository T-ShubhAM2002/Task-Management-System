# Task Management System

A full-stack MERN application for managing tasks and agents with user authentication.

## Features

- User Authentication (Admin-only)
- Agent Management
- Task Management
- CSV File Upload for Tasks
- Real-time Task Status Updates
- Responsive Dashboard
- User-specific Data Isolation

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

### Frontend
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls
- React Toastify for notifications

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=4001
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install @mui/material @emotion/react @emotion/styled  # For UI components
   npm install axios                                        # For API calls
   npm install react-router-dom                            # For routing
   npm install @mui/icons-material                         # For icons
   npm install react-toastify                              # For notifications
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Create new admin account
- POST `/api/auth/login` - Admin login
- POST `/api/auth/logout` - User logout

### Agents
- GET `/api/agents` - Get all agents for the current user
- GET `/api/agents/:id` - Get agent by ID
- POST `/api/agents` - Create new agent
- PUT `/api/agents/:id` - Update agent
- DELETE `/api/agents/:id` - Delete agent and redistribute tasks

### Tasks
- POST `/api/tasks/upload` - Upload and distribute tasks
- GET `/api/tasks` - Get all tasks for the current user
- GET `/api/tasks/agent/:agentId` - Get tasks by agent
- PUT `/api/tasks/:taskId/status` - Update task status
- DELETE `/api/tasks/:taskId` - Delete a task

## CSV File Format

The system accepts CSV files with the following columns:
- FirstName (Text)
- Phone (Number)
- Notes (Text)

Example:
```csv
FirstName,Phone,Notes
John,1234567890,Follow up required
Jane,9876543210,New lead
```

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- File type validation for uploads
- Input validation and sanitization
- User-specific data isolation

## User Management

The application implements a user-specific data isolation system where:
- Each user can only see and manage their own agents and tasks
- User authentication is required for all operations
- Admin-only access is enforced through the `isAdmin` flag
- User sessions are managed using JWT tokens

## Error Handling

The application includes comprehensive error handling for:
- Invalid credentials
- Duplicate entries
- File upload errors
- Database connection issues
- Invalid requests
- Authentication failures

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 