import { useAuth } from './contexts/AuthContext'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import './index.css'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-cyan mb-4"></div>
          <p className="font-orbitron text-neon-cyan text-xl">Initializing...</p>
        </div>
      </div>
    )
  }

  // Show Dashboard if authenticated, otherwise show Landing Page
  return isAuthenticated ? <Dashboard /> : <LandingPage />
}

export default App
