import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/themeProvider";
import { auth, getUserRole } from './lib/firebase';
import { useEffect, useState } from 'react';
import LandingPage from "./Pages/LandingPage.jsx";
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfile from './components/CandidateProfile';
import RecruiterDashboard from './pages/RecruiterDashboard';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import JobPage from './pages/Job';
import JobListing from './pages/JobListing';
import PostJob from './Pages/PostJob';
import SavedJobs from './Pages/SaveJob';
import MyJobs from './Pages/MyJob';
import Onboarding from './pages/Onboarding';
import RecruiterProfile from './components/RecruiterProfile';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [guestRole, setGuestRole] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        
        // Check for guest status from sessionStorage
        const guestStatus = sessionStorage.getItem('isGuest');
        if (guestStatus) {
          setIsGuestUser(true);
          setGuestRole(guestStatus);
          // Fix: Make sure userRole is properly set for guest users
          setUserRole(guestStatus); // This ensures userRole is 'recruiter' or 'candidate'
        } else {
          try {
            const role = await getUserRole(user.uid);
            setUserRole(role || 'candidate'); // Default to candidate if role is null
            setIsGuestUser(false);
            setGuestRole(null);
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole('candidate'); // Fallback to candidate
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        setIsGuestUser(false);
        setGuestRole(null);
        sessionStorage.removeItem('isGuest');
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
        isGuestUser ? (
          guestRole === 'recruiter' ? (
            <Navigate to="/recruiter-dashboard" replace />
          ) : (
            <Navigate to="/candidate-dashboard" replace />
          )
        ) : userRole === 'recruiter' ? (
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
      element: user ? <Navigate to="/" replace /> : <SignupPage />,
    },
    {
      path: '/onboarding',
      element: (
        <ProtectedRoute user={user} isGuest={isGuestUser}>
          <Onboarding />
        </ProtectedRoute>
      ),
    },
    // Candidate Routes
    {
      path: '/candidate-dashboard',
      element: (
        <RoleBasedRoute 
          allowedRoles={['candidate', 'guest']} 
          userRole={isGuestUser ? guestRole : userRole}
          isGuest={isGuestUser && guestRole === 'candidate'}
        >
          <CandidateDashboard isGuest={isGuestUser && guestRole === 'candidate'} />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/candidate-profile',
      element: (
        <RoleBasedRoute 
          allowedRoles={['candidate']} 
          userRole={isGuestUser ? guestRole : userRole}
          isGuest={false}
        >
          <CandidateProfile />
        </RoleBasedRoute>
      ),
    },
    // Recruiter Routes
    {
      path: '/recruiter-dashboard',
      element: (
        <RoleBasedRoute 
          allowedRoles={['recruiter']} 
          userRole={userRole}          
          isGuest={isGuestUser}
        >
          <RecruiterDashboard isGuest={isGuestUser && userRole === 'recruiter'} />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/recruiter-profile',
      element: (
        <RoleBasedRoute 
          allowedRoles={['recruiter']} 
          userRole={isGuestUser ? guestRole : userRole}
          isGuest={false}
        >
          <RecruiterProfile />
        </RoleBasedRoute>
      ),
    },
    // Shared Routes
    {
      path: '/job/:id',
      element: <JobPage isGuest={isGuestUser} />,
    },
    {
      path: '/jobs',
      element: <JobListing />,
    },
    {
      path: '/postjob',
      element: (
        <RoleBasedRoute 
          allowedRoles={['recruiter']} 
          userRole={isGuestUser ? guestRole : userRole}
          isGuest={false}
        >
          <PostJob />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/savedjobs',
      element: (
        <RoleBasedRoute 
          allowedRoles={['candidate']} 
          userRole={isGuestUser ? guestRole : userRole}
          isGuest={false}
        >
          <SavedJobs />
        </RoleBasedRoute>
      ),
    },
    {
      path: '/myjobs',
      element: (
        <ProtectedRoute user={user} isGuest={isGuestUser}>
          <MyJobs isGuest={isGuestUser && guestRole === 'recruiter'} />
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