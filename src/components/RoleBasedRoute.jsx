import { Navigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useEffect, useState } from 'react';

const RoleBasedRoute = ({ children, allowedRoles, userRole }) => {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user role is allowed
    const checkAccess = () => {
      if (allowedRoles.includes(userRole)) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    // If userRole is already provided, use it
    if (userRole !== null) {
      checkAccess();
    } else {
      // Otherwise, wait a bit for userRole to be set
      const timer = setTimeout(checkAccess, 500);
      return () => clearTimeout(timer);
    }
  }, [user, userRole, allowedRoles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!hasAccess) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;