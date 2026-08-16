import { Suspense, useState } from 'react'
import { isAuthenticated, removeAuthToken } from '@/data/auth'
import LoginForm from '@/presentation/components/auth/LoginForm'
import Dashboard from '@/presentation/Dashboard'
import SkeletonDashboard from '@/presentation/components/ui/SkeletonDashboard'

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())

  function handleLogout() {
    removeAuthToken()
    setAuthenticated(false)
  }

  if (!authenticated) {
    return <LoginForm onSuccess={() => setAuthenticated(true)} />
  }

  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <Dashboard onLogout={handleLogout} />
    </Suspense>
  )
}

export default App
