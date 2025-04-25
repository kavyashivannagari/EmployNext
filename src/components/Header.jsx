import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from "../lib/firebase";

export default function Header({ user, userRole }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileClick = () => {
    if (userRole === 'recruiter') {
      navigate('/recruiter-dashboard');
    } else if (userRole === 'candidate') {
      navigate('/candidate-dashboard');
    }
    // Add other roles if needed
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EmployNext
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600 transition">
              Browse Jobs
            </Link>
            {userRole === 'recruiter' && (
              <Link to="/postjob" className="text-gray-600 hover:text-blue-600 transition">
                Post Job
              </Link>
            )}
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                    <span className="text-gray-700">{user.displayName || 'User'}</span>
                  </button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}