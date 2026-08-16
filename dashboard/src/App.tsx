import { Suspense, useState } from 'react';
import { isAuthenticated, removeAuthToken } from '@/data/auth';
import LoginForm from '@/presentation/components/auth/LoginForm';
import Dashboard from '@/presentation/Dashboard';
import SkeletonDashboard from '@/presentation/components/ui/SkeletonDashboard';

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  if (!authenticated) {
    return <LoginForm onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <Dashboard
        onLogout={() => {
          removeAuthToken();
          setAuthenticated(false);
        }}
      />
    </Suspense>
  );
}

export default App;
