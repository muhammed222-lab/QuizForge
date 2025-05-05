Product Requirements Document (PRD) for QuizForge
1. Introduction
QuizForge is a web-based platform designed to streamline quiz creation and management for teachers. It allows teachers to create classes, upload educational materials (e.g., PDFs, notes) to Supabase Storage, and generate AI-powered quizzes based on selected documents. Teachers can customize quizzes with 5–20 questions (multiple-choice or true/false), set time limits and deadlines, and edit questions in a user-friendly interface. The AI generates extra questions (e.g., +5) for percentage-based shuffling, ensuring each student receives a randomized quiz. Students access quizzes via secure, time-limited links by entering their matriculation number and name, validated against a teacher-uploaded roster. Device fingerprinting prevents multiple attempts. Teachers access a comprehensive dashboard to view class details, quiz results, student performance, and submission times, with CSV export capabilities. The platform uses Vite, React, TypeScript (frontend), Express, TypeScript, Bun (backend), and Supabase (database, auth, storage), with our own ai impimetationm  API for quiz generation and FingerprintJS for device fingerprinting.
1.1 Objectives

Enable teachers to create classes and upload materials efficiently.
Generate customizable, AI-powered quizzes from selected documents.
Ensure quiz integrity with device fingerprinting and deadline enforcement.
Provide a comprehensive dashboard for class, quiz, and student insights.
Deliver a secure, scalable, and user-friendly experience.

1.2 Target Audience

Teachers: Create classes, upload materials, generate/edit quizzes, and analyze results.
Students: Access quizzes via secure links, entering matriculation number and name.

2. Functional Requirements
2.1 User Management

Teacher Accounts:
Sign up/login via Supabase Auth (Supabase Auth) using email/password or Google OAuth.
Profile management: Update name, email, institution, password.
Role-based access: Full control over classes, quizzes, and analytics.


Student Access:
Access quizzes via unique, time-limited links (expire after teacher-set deadline).
Enter matriculation number and name, validated against teacher-uploaded CSV roster in Supabase.
Option for anonymous access for practice quizzes (teacher toggle).
No student accounts required; data stored per quiz attempt.



2.2 Class Management

Features:
Create, edit, delete classes (name, subject, grade level, description).
Upload student rosters (CSV) with matriculation number and name to Supabase Database.
Upload materials (PDFs, text, max 10MB) to Supabase Storage (Supabase Storage).
Organize materials in folders (e.g., “Unit 1 Notes”).
View class summary: student count, materials, active quizzes.


UI:
Table listing classes with actions (edit, delete, view).
Drag-and-drop file upload interface for materials and rosters.



2.3 Quiz Creation

Document Selection:
Teachers select one or more documents from Supabase Storage for a class.
Display documents in a list (name, upload date, size).


AI Quiz Generation:
Teachers set:
Question count (N, 5–20).
Question type: multiple-choice (4 options, single correct) or true/false.
Time limit (10–60 minutes).
Deadline (date/time after which link is inaccessible).


AI via our own ai impimetationm  API (our own ai impimetationm  API) extracts text from documents using pdf-parse (pdf-parse) and generates N + 5 questions (e.g., 25 for 20).
Store questions in Supabase to prevent re-generation on refresh.
Use a queue system (Express or Supabase edge functions) for uninterrupted generation.
Show progress bar (e.g., “Generating 25/25 questions”).


Question Editing:
Card-based UI (Tailwind CSS (Tailwind CSS)):
Question text (editable textarea).
Answers: inputs for multiple-choice (4 options), toggle for true/false.
Correct answer selector (radio button for multiple-choice, toggle for true/false).
Buttons: add question, delete question, save changes.


Real-time saves to Supabase using Supabase’s TypeScript SDK.
“Preview Quiz” button to test as a student.


Question Bank:
Save questions to a bank in Supabase, tagged by class, topic, or type.
Reuse questions for future quizzes.


Quiz Settings:
Enable/disable shuffling (questions and answers).
Set strict timing (auto-submit on expiry).
Set deadline for link accessibility.



2.4 Quiz Delivery

Student Access:
Access via unique link generated in Supabase, valid until deadline.
Form to enter matriculation number and name, validated against roster.


Timing:
Strict countdown timer (React component) based on teacher-set limit.
Auto-submit answers to Supabase when time expires.
Record submission time (e.g., “25:30/30:00”) in Supabase.


Shuffling:
For N questions (e.g., 20), select N from N + 5 (e.g., 25) using percentage-based shuffling:
Assign each question a random weight (0–100%) using crypto.randomInt (Node.js Crypto).
Sort by weight, pick top N questions.


Shuffle multiple-choice answer orders similarly (random weights per option).
Store each student’s question/answer order in Supabase for grading and verification.


Student UI:
Responsive (desktop/mobile) with Tailwind CSS.
Show question, answers, timer, progress bar (e.g., “Question 5/20”).
Navigation: next, previous, submit.
Autosave answers to Supabase on change.
Confirmation on submission: “Quiz submitted successfully.”



2.5 Security and Integrity

Authentication:
Supabase Auth for teachers (email/password, Google OAuth).
JWT tokens for API access.


Device Fingerprinting:
Collect browser type, OS, screen size, canvas hash using FingerprintJS (FingerprintJS).
Store in Supabase to detect multiple attempts (unless retries allowed).
Block attempts from same fingerprint if retries disabled.


Link Security:
Quiz links expire after deadline (checked via Supabase query).
Links tied to class roster (valid only for enrolled students).


Data Privacy:
Encrypt sensitive data (matriculation numbers, fingerprints) in Supabase (AES-256).
GDPR/CCPA compliance: transparent data collection, opt-in for practice quizzes.



2.6 Teacher Dashboard

Overview:
Centralized page with sections:
Classes: List (name, student count, active quizzes, view button).
Quizzes: List (title, class, status, average score, view results).
Students: List (name, matriculation number, quiz count, average score).


Search bar to filter by class, quiz, or student.


Quiz Results:
Table: student name, matriculation number, score, submission time (e.g., “25:30/30:00”).
Bar chart (Chart.js (Chart.js)): score distribution (e.g., 0–20%, 21–40%).
Question performance: % correct per question.
Show selected documents for the quiz.


Student View:
Quiz history: quiz title, score, submission time.
Matriculation number and attempt details.


Export:
Download results as CSV (columns: name, matriculation number, score, time).


Real-Time:
Supabase real-time subscriptions update dashboard on submissions.


UI:
Card-based layout (Tailwind CSS).
Responsive, mobile-friendly.
Tooltips for clarity (e.g., “Submission Time: Time taken to complete quiz”).



2.7 Notifications

Teachers:
Email (via Supabase edge functions) for quiz completion summaries.
No real-time activity alerts (per user request).


Students:
No email notifications; deadlines set by teachers control access.



3. Non-Functional Requirements
3.1 Performance

Page load time: <2 seconds.
API response time: <500ms for 95% of requests.
Quiz generation: <30 seconds for 25 questions.
Support 500 concurrent quiz takers per teacher.

3.2 Scalability

Handle 5,000 teachers and 50,000 students in year 1.
Supabase PostgreSQL scales with cloud infrastructure.
Cache AI questions in Supabase to reduce API calls.

3.3 Security

Encrypt data in transit (TLS) and at rest (AES-256).
Supabase row-level security for data access.
Regular security audits.
GDPR/CCPA compliance.

3.4 Usability

Intuitive UI with <5-minute learning curve.
WCAG 2.1 compliance (accessible colors, screen reader support).
English only (initially).

3.5 Reliability

99.9% uptime.
Daily backups of Supabase data.
Resume quiz generation on failure (stored status).

4. Technical Stack

Frontend:
Vite (Vite), React, TypeScript.
Tailwind CSS for styling.
React Router for navigation.
Axios for API calls.
Chart.js for dashboard visuals.


Backend:
Express API with TypeScript.
Bun runtime (Bun) for performance.
RESTful API (JSON).
pdf-parse for document text extraction.
FingerprintJS for device fingerprinting.


Database & Storage:
Supabase PostgreSQL: classes, rosters, questions, results, fingerprints.
Supabase Storage: materials (PDFs, text, 10MB limit).
Supabase Auth: teacher accounts (email, Google).
Real-time subscriptions for dashboard updates.


AI:
our own ai impimetationm  API for quiz generation.
Cache questions in Supabase.


Queue:
In-memory queue (Express) or Supabase edge functions for quiz generation.



5. Supabase Schema



Table
Columns



classes
id (UUID, primary key), teacher_id (UUID, foreign key), name (string), subject (string), grade_level (string)


students
id (UUID), class_id (UUID), matriculation_number (string, unique), name (string)


materials
id (UUID), class_id (UUID), file_name (string), file_path (string)


quizzes
id (UUID), class_id (UUID), title (string), question_count (int), time_limit (int, minutes), deadline (datetime), material_ids (array of UUIDs)


questions
id (UUID), quiz_id (UUID), text (string), type (enum: multiple_choice, true_false), options (JSON: [{text, is_correct}])


attempts
id (UUID), quiz_id (UUID), student_id (UUID), fingerprint (string), start_time (datetime), end_time (datetime), score (float), question_order (JSON)


6. User Stories

Teacher:
I want to upload a PDF and generate a 20-question quiz based on it.
I want to edit AI-generated questions in a clean UI.
I want to set a quiz deadline so students can’t access it afterward.
I want to see a dashboard with student scores and submission times.
I want to download quiz results as a CSV.


Student:
I want to access a quiz by entering my matriculation number and name.
I want to take a timed quiz with randomized questions.
I want a mobile-friendly quiz page with a progress bar.



7. Milestones

Phase 1 (0–3 Months):
Teacher auth, class creation, roster/material upload.


Phase 2 (4–6 Months):
AI quiz generation, question editing, shuffling.


Phase 3 (7–9 Months):
Quiz delivery, device fingerprinting, deadline enforcement.


Phase 4 (10–12 Months):
Dashboard with charts, CSV export, real-time updates.



8. Risks and Mitigation



Risk
Mitigation



AI generates inaccurate questions
Allow teacher editing; use reliable our own ai impimetationm  API


Privacy concerns with fingerprints
GDPR/CCPA compliance, transparent policies


Supabase Storage limits reached
Enforce 10MB file limit; monitor usage


Deadline enforcement fails
Validate deadlines server-side with Supabase, Supabase queries


9. Success Metrics

500 active teachers in 6 months.
90% quiz completion rate.
Teacher satisfaction: 4/5 in surveys.
<1% downtime during peak usage.

10. Implementation Guide for AI Coding Agent
To implement QuizForge, follow these steps to ensure accurate development and avoid errors:
10.1 Project Structure



Directory
Purpose



frontend/src/components
Reusable React components (e.g., QuizCard, DashboardTable)


frontend/src/pages
Page components (e.g., ClassPage, QuizPage)


frontend/src/services
Supabase client, API calls (e.g., supabaseClient.ts, quizService.ts)


frontend/src/utils
Helpers (e.g., formatTime.ts, shuffleArray.ts)


backend/src/controllers
Express route handlers (e.g., quizController.ts)


backend/src/models
TypeScript interfaces (e.g., Quiz.ts, Student.ts)


backend/src/services
Supabase, AI API interactions (e.g., supabaseService.ts, our own ai impimetationm Service.ts)


backend/src/utils
Utilities (e.g., pdfExtractor.ts, fingerprintValidator.ts)


10.2 Setup Instructions

Initialize Projects:
Frontend: npm create vite@latest frontend -- --template react-ts
Backend: mkdir backend && cd backend && bun init


Install Dependencies:
Frontend: npm install @supabase/supabase-js axios tailwindcss postcss autoprefixer chart.js react-router-dom
Backend: bun add express typescript @supabase/supabase-js pdf-parse fingerprintjs


Configure Environment:
Frontend .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
Backend .env: SUPABASE_URL, SUPABASE_KEY, our own ai impimetationm _API_KEY



10.3 Key Implementation Steps

Supabase Setup:
Create Supabase project (Supabase Dashboard).
Set up storage bucket (materials) and tables per schema.
Initialize client in frontend/src/services/supabaseClient.ts:import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);




Authentication:
Implement login/signup in frontend/src/pages/AuthPage.tsx using Supabase Auth.
Protect backend routes with JWT middleware in backend/src/middleware/auth.ts.


Material Upload:
Create upload component in frontend/src/components/MaterialUpload.tsx.
Upload to Supabase Storage: supabase.storage.from('materials').upload(filePath, file).


Quiz Generation:
Extract PDF text in backend/src/utils/pdfExtractor.ts using pdf-parse.
Call our own ai impimetationm  API in backend/src/services/our own ai impimetationm Service.ts:async function generateQuestions(text: string, count: number, type: string) {
  
}


Store questions in Supabase.


Question Editing:
Build frontend/src/components/QuestionEditor.tsx with card-based UI.
Save edits: supabase.from('questions').update(data).eq('id', questionId).


Quiz Delivery:
Generate links in backend/src/controllers/quizController.ts.
Validate student access and fingerprints in backend/src/utils/fingerprintValidator.ts:import FingerprintJS from 'fingerprintjs2';
async function getFingerprint(): Promise<string> {
  const components = await FingerprintJS.getPromise();
  return FingerprintJS.x64hash128(components.map(c => c.value).join(), 31);
}


Shuffle questions/answers in backend/src/utils/shuffle.ts:function shuffleQuestions(questions: Question[], count: number): Question[] {
  const weighted = questions.map(q => ({ question: q, weight: Math.random() * 100 }));
  return weighted.sort((a, b) => b.weight - a.weight).slice(0, count).map(w => w.question);
}




Dashboard:
Build frontend/src/pages/DashboardPage.tsx with tables and Chart.js.
Subscribe to real-time updates: supabase.from('attempts').on('INSERT', updateDashboard).subscribe().



10.4 Best Practices

TypeScript: Use interfaces for all data models (e.g., interface Quiz { id: string; title: string; }).
Error Handling: Wrap API calls in try-catch; log errors to console.
Testing: Write unit tests for shuffling and fingerprinting logic using Jest.
Naming: Use descriptive names (e.g., generateQuizQuestions, validateStudentAccess).
Documentation: Comment complex logic; maintain README.md.

10.5 Prompt for AI Coding Agent
To implement QuizForge accurately, use this prompt for your AI coding agent:
Prompt:"Develop a web application called QuizForge using Vite, React, TypeScript for the frontend, and Express, TypeScript, Bun for the backend, with Supabase for database, authentication, and storage. Follow the QuizForge PRD exactly, implementing all features: teacher authentication, class creation, material upload to Supabase Storage, AI quiz generation using our own ai impimetationm  API, question editing, quiz delivery with device fingerprinting (FingerprintJS), and a teacher dashboard with real-time updates and CSV export. Use the specified folder structure: frontend/src/{components,pages,services,utils} and backend/src/{controllers,models,services,utils}. Ensure quizzes have 5–20 questions (multiple-choice or true/false), generate +5 extra questions for percentage-based shuffling, enforce time limits and deadlines, and validate student access with matriculation number and name. Use Tailwind CSS for responsive UI and Chart.js for dashboard visuals. Implement robust error handling, TypeScript interfaces, and unit tests. Store all data in Supabase per the schema. Avoid features like tab-switching monitoring or student email notifications. Follow these steps:  

Set up Vite and Express projects with TypeScript.  
Configure Supabase client and environment variables.  
Implement teacher auth with Supabase Auth.  
Build class management with roster and material uploads.  
Develop quiz creation with our own ai impimetationm  API and editing UI.  
Implement quiz delivery with shuffling, fingerprinting, and timing.  
Create dashboard with real-time updates and CSV export.  
Ensure security (encryption, GDPR compliance) and performance (<2s page loads).Use pdf-parse for text extraction, crypto.randomInt for shuffling, and Supabase real-time subscriptions. Document code and maintain a README.md. Avoid hallucinations by strictly adhering to the PRD and verifying each feature against requirements."

