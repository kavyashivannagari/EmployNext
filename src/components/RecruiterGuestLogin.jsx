import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAsRecruiterGuest } from '../lib/firebase';
import { Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RecruiterGuestLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loginAsRecruiterGuest();
      navigate('/recruiter-dashboard');
    } catch (err) {
      console.error('Guest login error:', err);
      setError(err.message);
      
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid guest credentials. Please contact support.');
      } else {
        setError('Failed to login as guest. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Recruiter Guest Access</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
            Experience our recruiter dashboard with demo data. No account required!
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Enter as Guest Recruiter'
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Want full access?{' '}
              <button 
                onClick={() => navigate('/signup?role=recruiter')}
                className="text-blue-600 hover:underline"
              >
                Sign up as a recruiter
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}