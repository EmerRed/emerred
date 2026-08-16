import { Suspense, useState } from 'react';
import { isAuthenticated, removeAuthToken } from '@/data/auth';
import LoginForm from '@/presentation/components/auth/LoginForm';
import Dashboard from '@/presentation/Dashboard';
import PublicPortal from '@/presentation/components/public/PublicPortal';
import SkeletonDashboard from '@/presentation/components/ui/SkeletonDashboard';

type AppView = 'public' | 'admin';

function App() {
  const [view, setView] = useState<AppView>('public');
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  function handleLogout() {
    removeAuthToken();
    setAuthenticated(false);
    setView('public');
  }

  // Admin View (Operator Console)
  if (view === 'admin') {
    if (!authenticated) {
      return (
        <LoginForm
          onSuccess={() => {
            setAuthenticated(true);
            setView('admin');
          }}
          onBack={() => setView('public')}
        />
      );
    }

    return (
      <Suspense fallback={<SkeletonDashboard />}>
        <Dashboard
          onLogout={handleLogout}
          onBackToPublic={() => setView('public')}
        />
      </Suspense>
    );
  }

  // Default: Public Emergency Assistance Portal for Cali Earthquake
  return (
    <PublicPortal
      onOpenAdmin={() => setView('admin')}
    />
  );
}

export default App;
