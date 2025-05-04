import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './login';
import SignupPage from './signup';

export default function AuthPage() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
