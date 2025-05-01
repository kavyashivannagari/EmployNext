// src/components/ProtectedRoute.jsx
import { Navigate,useLocation } from 'react-router-dom';
import { auth } from '@/lib/firebase';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check both auth.currentUser and sessionStorage for guest access
  const isAuthenticated = auth.currentUser || sessionStorage.getItem('isGuest');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;