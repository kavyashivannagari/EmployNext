import { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import { auth, getUserProfile, getJobsByRecruiter } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import PostJobModal from '../components/PostModal';

const JobItem = ({ job }) => {
  const postedDate = job.postedAt && new Date(job.postedAt.seconds * 1000).toLocaleDateString();
  const applicationsCount = job.applications?.length || 0;
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.location}</p>
            <div className="flex gap-2 mt-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {job.type}
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                ${job.minSalary} - ${job.maxSalary}
              </span>
            </div>
          </div>
          <div className="mt-2 md:mt-0 text-right">
            <p className="text-xs text-gray-500">Posted: {postedDate || 'N/A'}</p>
            <p className="text-sm mt-1">
              <span className="font-bold">{applicationsCount}</span> application{applicationsCount !== 1 && 's'}
            </p>
            <Link to={`/job/${job.id}`} className="text-blue-600 text-sm hover:underline block mt-2">
              View Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecruiterDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const profileData = await getUserProfile(user.uid);
        setUserProfile(profileData);

        const jobsData = await getJobsByRecruiter(user.uid);
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const openPostJobModal = () => {
    setIsModalOpen(true);
  };

  const closePostJobModal = () => {
    setIsModalOpen(false);
    // Refresh jobs after posting
    if (auth.currentUser) {
      getJobsByRecruiter(auth.currentUser.uid).then(jobsData => {
        setJobs(jobsData);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={auth.currentUser} userRole="recruiter" />
      
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Company Profile Section */}
            <div className="md:w-1/3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {userProfile?.companyName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{userProfile?.companyName || 'Company'}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{userProfile?.industry || 'Industry'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Recruiter</h3>
                      <p>{userProfile?.fullName || 'Not specified'}</p>
                      <p className="text-sm text-gray-500">{userProfile?.position || 'Position'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Location</h3>
                      <p>{userProfile?.location || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Website</h3>
                      <a 
                        href={userProfile?.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {userProfile?.companyWebsite || 'Not specified'}
                      </a>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">About</h3>
                      <p className="text-sm">{userProfile?.companyDescription || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link to="/recruiter-profile" className="text-blue-600 text-sm hover:underline">
                      Edit Profile
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 grid grid-cols-1 gap-4">
                <button 
                  onClick={openPostJobModal}
                  className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700 transition-colors"
                >
                  Post New Job
                </button>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="md:w-2/3">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Dashboard Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                      <h3 className="text-lg font-semibold">{jobs.length}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Job Listings</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                      <h3 className="text-lg font-semibold">
                        {jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                      <h3 className="text-lg font-semibold">
                        {jobs.reduce((sum, job) => {
                          const interviewCount = job.applications?.filter(app => app.status === 'interview')?.length || 0;
                          return sum + interviewCount;
                        }, 0)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Interview Stage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Job Listings</CardTitle>
                  <Link to="/myjobs" className="text-blue-600 text-sm hover:underline">
                    View All
                  </Link>
                </CardHeader>
                <CardContent>
                  {jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You haven't posted any jobs yet.</p>
                      <button 
                        onClick={openPostJobModal}
                        className="text-blue-600 hover:underlineir mt-2 inline-block"
                      >
                        Post Your First Job
                      </button>
                    </div>
                  ) : (
                    <div>
                      {jobs.slice(0, 3).map((job) => (
                        <JobItem key={job.id} job={job} />
                      ))}
                      
                      {jobs.length > 3 && (
                        <div className="text-center mt-4">
                          <Link to="/myjobs" className="text-blue-600 hover:underline">
                            View {jobs.length - 3} more job{jobs.length - 3 !== 1 && 's'}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {isModalOpen && <PostJobModal isOpen={isModalOpen} onClose={closePostJobModal} />}
      
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;