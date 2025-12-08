import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Fleet from './pages/Fleet';
import Operations from './pages/Operations';
import Research from './pages/Research';
import Vault from './pages/Vault';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Market from './pages/Market';
import Talents from './pages/Talents';
import Galaxy from './pages/Galaxy';
import Alliance from './pages/Alliance';
import ChatWidget from './components/ChatWidget';
import { SoundProvider } from './contexts/SoundContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🌌</div>
          <p className="font-orbitron text-2xl text-neon-cyan">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <BrowserRouter>
      <SoundProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0a0e27',
              color: '#fff',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#00f0ff',
                secondary: '#0a0e27',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4444',
                secondary: '#0a0e27',
              },
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/research" element={<Research />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/market" element={<Market />} />
            <Route path="/talents" element={<Talents />} />
            <Route path="/galaxy" element={<Galaxy />} />
            <Route path="/alliance" element={<Alliance />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ChatWidget />
        </Layout>
      </SoundProvider>
    </BrowserRouter>
  );
}

export default App;
