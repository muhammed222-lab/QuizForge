import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';

// Import contexts
import { AuthProvider } from '@/contexts/AuthContext';

// Import auth components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';

// Import pages
import LandingPage from '@/pages/landing';
import AuthPage from '@/pages/auth';
import DashboardPage from '@/pages/dashboard';
import ClassesPage from '@/pages/classes';
import CreateClassPage from '@/pages/classes/create';
import ClassDetailPage from '@/pages/classes/[id]';
import ExamsPage from '@/pages/exams';
import CreateExamPage from '@/pages/exams/create';
import EditExamPage from '@/pages/exams/edit';
import StudentsPage from '@/pages/students';
import AnalyticsPage from '@/pages/analytics';
import SettingsPage from '@/pages/settings';
import StudentExamPage from '@/pages/student/exam';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth routes - Always accessible but redirect if logged in */}
            <Route
              path="/auth/*"
              element={
                <PublicRoute restricted>
                  <AuthPage />
                </PublicRoute>
              }
            />

            {/* Student exam route - No auth required */}
            <Route
              path="/exam/:id"
              element={<StudentExamPage />}
            />

            {/* Protected routes */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="classes" element={<ClassesPage />} />
                      <Route path="classes/create" element={<CreateClassPage />} />
                      <Route path="classes/:id" element={<ClassDetailPage />} />
                      <Route path="exams" element={<ExamsPage />} />
                      <Route path="exams/create" element={<CreateExamPage />} />
                      <Route path="exams/edit/:id" element={<EditExamPage />} />
                      <Route path="students" element={<StudentsPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect any other routes to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
