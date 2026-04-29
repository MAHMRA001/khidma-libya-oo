import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import WorkerList from './pages/WorkerList';
import WorkerProfile from './pages/WorkerProfile';
import CreateWorkerProfile from './pages/CreateWorkerProfile';
import CreateJobPost from './pages/CreateJobPost';
import JobPosts from './pages/JobPosts';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import WorkerMap from './pages/WorkerMap';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ position: 'relative', width: '100%' }}
      >
        <Routes location={location}>
          <Route path="/welcome" element={<Welcome />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/workers" element={<WorkerList />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/create-worker-profile" element={<CreateWorkerProfile />} />
            <Route path="/create-job" element={<CreateJobPost />} />
            <Route path="/jobs" element={<JobPosts />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/map" element={<WorkerMap />} />
          </Route>
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return <AnimatedRoutes />;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App