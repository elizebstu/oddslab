import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoomDetail from './pages/RoomDetail';
import PublicRoom from './pages/PublicRoom';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Booting Oddslab..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/explore" element={<Layout><Explore /></Layout>} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Layout showNavbar={false} showFooter={false}><Login /></Layout>} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Layout showNavbar={false} showFooter={false}><Register /></Layout>} />
        <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/rooms/:id" element={user ? <Layout><RoomDetail /></Layout> : <Navigate to="/login" />} />
        <Route path="/public/:id" element={<Layout><PublicRoom /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
