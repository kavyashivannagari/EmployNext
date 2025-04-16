// src/components/RoleBasedRoute.jsx
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ allowedRoles, userRole, children }) => {
  // If we don't have a role yet or the role is not in allowed roles, redirect to login
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default RoleBasedRoute;