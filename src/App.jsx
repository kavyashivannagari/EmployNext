import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/themeProvider";
import { auth, getUserRole } from './lib/firebase';
import { useEffect, useState } from 'react';
import LandingPage from "./Pages/LandingPage";
import CandidateDashboard from './Pages/CandidateDashboard';
import CandidateProfile from './components/CandidateProfile';
import RecruiterDashboard from './Pages/RecruiterDashboard';
import LoginPage from './Pages/Login';
import SignupPage from './Pages/Signup';
import ProtectedRoute from'./components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import JobPage from './Pages/Job';
import JobListing from './Pages/JobListing';
import PostJob from './Pages/PostJob';
import SavedJobs from './Pages/SaveJob';
import MyJobs from './Pages/MyJob';
import Onboarding from './Pages/Onboarding';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Fetch user role from Firestore
        try {
          const role = await getUserRole(user.uid);
          setUserRole(role);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage user={user} userRole={userRole} />,
    },
    {
      // path: '/login',
      // element : <LoginPage />
      path: "/login",
      // element: user ? <Navigate to="/candidate-dashboard" /> : <LoginPage />
      element: user ? <Navigate to={userRole === 'recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard'} /> : <LoginPage />
    },
    {
      path: '/signup',
      element: user ? <LoginPage /> :<SignupPage />
    },
    {
      path: '/onboarding',
      element: <Onboarding />
    },
    {
      path: '/candidate-dashboard',
      element: (
        <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
          <CandidateDashboard />
        </RoleBasedRoute>
      )
    },
    {
      path: '/candidate-profile',
      element: (
        <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
          <CandidateProfile />
        </RoleBasedRoute>
      )
    },
    {
      path: '/recruiter-dashboard',
      element: (
        <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
          <RecruiterDashboard />
        </RoleBasedRoute>
      )
    },
    {
      path: '/job/:id',
      element: <JobPage />
    },
    {
      path: '/jobs',
      element: <JobListing />
    },
    {
      path: '/postjob',
      element: (
        <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
          <PostJob />
        </RoleBasedRoute>
      )
    },
    {
      path: '/savedjobs',
      element: (
        <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
          <SavedJobs />
        </RoleBasedRoute>
      )
    },
    {
      path: '/myjobs',
      element: (
        <ProtectedRoute user={user}>
          <MyJobs />
        </ProtectedRoute>
      )
    },
    {
      path: '*',
      element: <Navigate to="/" />
    }
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;