# QuizForge API

This is the backend API for the QuizForge application, built with Express.js and Supabase.

## Features

- Authentication (login, register, logout)
- Class management
- Exam creation and management
- Student management
- Question generation and management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or bun

### Installation

1. Clone the repository
2. Navigate to the api directory
3. Install dependencies:

```bash
npm install
# or
bun install
```

4. Create a `.env` file based on `.env.example` and fill in your Supabase credentials

### Running the API

```bash
npm run dev
# or
bun run dev
```

Or use the provided script:

```bash
./start-server.sh
```

The API will be available at http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login (supports both email and matric number)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password

### Classes

- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create a new class
- `GET /api/classes/:id` - Get a class by ID
- `PATCH /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class
- `POST /api/classes/:id/students` - Add students to a class
- `DELETE /api/classes/:id/students/:studentId` - Remove a student from a class

### Exams

- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create a new exam
- `GET /api/exams/:id` - Get an exam by ID
- `PATCH /api/exams/:id` - Update an exam
- `DELETE /api/exams/:id` - Delete an exam
- `POST /api/exams/:id/generate` - Generate questions for an exam
- `POST /api/exams/:id/publish` - Publish an exam

### Students

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get a student by ID
- `POST /api/students/invite` - Invite students
- `POST /api/students/create` - Create student accounts

### Questions

- `GET /api/questions` - Get questions for an exam
- `POST /api/questions` - Create a new question
- `GET /api/questions/:id` - Get a question by ID
- `PATCH /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question
- `POST /api/questions/bulk` - Create multiple questions at once

## Database Schema

The API uses Supabase as the database and authentication provider. The main tables are:

- `profiles` - Additional user information including matric numbers for students
- `classes` - Classes created by teachers
- `class_students` - Junction table for students in classes
- `exams` - Exams created for classes
- `questions` - Questions for exams
- `exam_results` - Student exam results

## Authentication

The API uses JWT tokens for authentication. Teachers login with email/password, while students can login with matric number/password.
