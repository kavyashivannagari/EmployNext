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
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import JobPage from './Pages/Job';
import JobListing from './Pages/JobListing';
import PostJob from './Pages/PostJob';
import SavedJobs from './Pages/SaveJob';
import MyJobs from './Pages/MyJob';
import Onboarding from './Pages/Onboarding';
import RecruiterProfile from './components/RecruiterProfile';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        
        // Check if the user is a guest recruiter
        const isGuest = user.email === 'guest-recruiter@employnext.com';
        setIsGuestUser(isGuest);
        
        try {
          const role = await getUserRole(user.uid);
          // If it's a guest user and role isn't set, default to recruiter
          if (isGuest && !role) {
            setUserRole('recruiter');
          } else {
            setUserRole(role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setIsGuestUser(false);
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
      path: "/login",
      element: user ? (
        userRole === 'recruiter' ? (
          <Navigate to="/recruiter-dashboard" replace />
        ) : (
          <Navigate to="/candidate-dashboard" replace />
        )
      ) : (
        <LoginPage />
      ),
    },
    {
      path: '/signup',
      element: user ? (
        userRole === 'recruiter' ? (
          <Navigate to="/recruiter-dashboard" replace />
        ) : (
          <Navigate to="/candidate-dashboard" replace />
        )
      ) : (
        <SignupPage />
      ),
    },
    {
      path: '/onboarding',
      element: (
        <ProtectedRoute user={user}>
          <Onboarding />
        </ProtectedRoute>
      ),
    },
    // Candidate Routes
    {
      path: '/candidate-dashboard',
      element: (
        <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
          <CandidateDashboard />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/candidate-profile',
      element: (
        <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
          <CandidateProfile />
        </RoleBasedRoute>
      ),
    },
    // Recruiter Routes
    {
      path: '/recruiter-dashboard',
      element: (
        <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
          <RecruiterDashboard isGuestUser={isGuestUser} />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/recruiter-profile',
      element: (
        <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
          <RecruiterProfile isGuestUser={isGuestUser} />
        </RoleBasedRoute>
      ),
    },
    // Shared Routes
    {
      path: '/job/:id',
      element: <JobPage />,
    },
    {
      path: '/jobs',
      element: <JobListing />,
    },
    {
      path: '/postjob',
      element: (
        <RoleBasedRoute allowedRoles={['recruiter']} userRole={userRole}>
          <PostJob isGuestUser={isGuestUser} />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/savedjobs',
      element: (
        <RoleBasedRoute allowedRoles={['candidate']} userRole={userRole}>
          <SavedJobs />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/myjobs',
      element: (
        <ProtectedRoute user={user}>
          <MyJobs isGuestUser={isGuestUser} />
        </ProtectedRoute>
      ),
    },
    // Fallback Route
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
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