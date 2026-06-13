import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import Onboarding from './pages/Onboarding';
import Businesses from './pages/Businesses';
import BusinessDetail from './pages/BusinessDetail';
import CreateBusiness from './pages/CreateBusiness';
import Login from './pages/Login';


const TAB_PATHS_ANIM = ['/', '/jobs', '/messages', '/profile'];

const AnimatedRoutes = () => {
  const location = useLocation();
  const isTabPath = TAB_PATHS_ANIM.includes(location.pathname);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isTabPath ? 'tabs' : location.pathname}
        initial={isTabPath ? {} : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={isTabPath ? {} : { opacity: 0, x: -18 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ position: 'relative', width: '100%' }}
      >
        <Routes location={location}>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={null} />
            <Route path="/workers" element={<WorkerList />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/create-worker-profile" element={<CreateWorkerProfile />} />
            <Route path="/create-job" element={<CreateJobPost />} />
            <Route path="/jobs" element={null} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/profile" element={null} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/messages" element={null} />
            <Route path="/map" element={<WorkerMap />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/business/:id" element={<BusinessDetail />} />
            <Route path="/create-business" element={<CreateBusiness />} />
          </Route>
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  return <AnimatedRoutes />;
};

function App() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => document.documentElement.classList.toggle('dark', e.matches);
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

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