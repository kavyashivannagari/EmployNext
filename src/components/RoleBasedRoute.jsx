import { Navigate, useLocation } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles, userRole, isGuest }) => {
  const location = useLocation();

  if (isGuest && allowedRoles.includes('guest')) {
    return children;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RoleBasedRoute;