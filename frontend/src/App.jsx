import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/authentication/login.jsx';
import Signup from './components/authentication/Signup.jsx';
import ForgotPassword from './components/authentication/ForgotPassword.jsx';
import ResetPassword from './components/authentication/ResetPassword.jsx';
import Placeholder from './components/authentication/Placeholder.jsx';
import Landing from './components/Landing/landing.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={<Placeholder title="Dashboard" note="You are signed in. The dashboard comes in a later week." />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;