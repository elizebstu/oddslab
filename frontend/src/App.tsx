import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import OtpLogin from './pages/OtpLogin';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import RoomDetail from './pages/RoomDetail';
import PublicRoom from './pages/PublicRoom';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Booting Oddslab..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/explore" element={<Layout><Explore /></Layout>} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Layout showNavbar={false} showFooter={false}><Login /></Layout>} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Layout showNavbar={false} showFooter={false}><Register /></Layout>} />
      <Route path="/otp-login" element={user ? <Navigate to="/dashboard" /> : <Layout showNavbar={false} showFooter={false}><OtpLogin /></Layout>} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <Layout showNavbar={false} showFooter={false}><ForgotPassword /></Layout>} />
      <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/rooms/:id" element={user ? <Layout><RoomDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/public/:id" element={<Layout><PublicRoom /></Layout>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
