import { Navigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

const RoleBasedRoute = ({ children, allowedRoles, userRole }) => {
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;