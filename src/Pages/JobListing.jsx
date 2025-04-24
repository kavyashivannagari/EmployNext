import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  auth, 
  getJobs, 
  isJobSaved, 
  saveJob, 
  unsaveJob, 
  applyToJob, 
  getUserProfile, 
  getUserApplications,
  cancelApplication,
  uploadResume
} from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Briefcase, MapPin, DollarSign, Clock, Search, BookmarkPlus, BookmarkCheck, X } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import ApplyModal from '../components/ApplicationModal';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobIds, setSavedJobIds] = useState({});
  const [user, setUser] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState({});
  const [applicationIds, setApplicationIds] = useState({});
  const [alert, setAlert] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getJobs();
        setJobs(jobsData);
        
        if (user) {
          const savedStatuses = {};
          const applications = await getUserApplications(user.uid);
          const appliedStatuses = {};
          const appIds = {};
          
          applications.forEach(app => {
            appliedStatuses[app.jobId] = true;
            appIds[app.jobId] = app.id;
          });
          
          for (const job of jobsData) {
            const isSaved = await isJobSaved(user.uid, job.id);
            savedStatuses[job.id] = isSaved;
          }
          
          setSavedJobIds(savedStatuses);
          setAppliedJobIds(appliedStatuses);
          setApplicationIds(appIds);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (applyModalOpen && user) {
        try {
          const profileData = await getUserProfile(user.uid);
          setProfile(profileData || {});
        } catch (err) {
          console.error("Error loading profile:", err);
          setError("Failed to load profile data");
        }
      }
    };
    loadProfile();
  }, [applyModalOpen, user]);

  const handleSaveJob = async (jobId) => {
    if (!user) {
      setAlert({ type: 'error', message: 'Please login to save jobs' });
      return;
    }
    
    try {
      if (savedJobIds[jobId]) {
        await unsaveJob(user.uid, jobId);
        setSavedJobIds({ ...savedJobIds, [jobId]: false });
        setAlert({ type: 'success', message: 'Job removed from saved list' });
      } else {
        await saveJob(user.uid, jobId);
        setSavedJobIds({ ...savedJobIds, [jobId]: true });
        setAlert({ type: 'success', message: 'Job saved successfully' });
      }
    } catch (err) {
      console.error("Error saving/unsaving job:", err);
      if (err.code === 'permission-denied') {
        setAlert({ type: 'error', message: 'You do not have permission to save jobs. Please contact support.' });
      } else {
        setAlert({ type: 'error', message: 'Failed to save job. Please try again.' });
      }
    }
  };

  const handleApplyClick = (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs` } });
      return;
    }
    setSelectedJobId(jobId);
    setApplyModalOpen(true);
  };

  const handleApplicationSubmit = async (resumeFile) => {
    try {
      let resumeUrl = profile?.resumeUrl;
      
      if (resumeFile) {
        console.log('Uploading file:', resumeFile.name, resumeFile.type);
        resumeUrl = await uploadResume(user.uid, resumeFile);
        console.log('Upload successful, URL:', resumeUrl);
      }
      
      if (!resumeUrl) {
        throw new Error('Resume is required to apply');
      }
      
      const applicationId = await applyToJob(user.uid, selectedJobId, { resumeUrl });
      setAppliedJobIds({ ...appliedJobIds, [selectedJobId]: true });
      setApplicationIds({ ...applicationIds, [selectedJobId]: applicationId });
      setAlert({ type: 'success', message: 'Application submitted successfully!' });
      setApplyModalOpen(false);

      // Update jobs list to reflect the new application count
      setJobs(jobs.map(job => 
        job.id === selectedJobId 
          ? { ...job, applicationCount: (job.applicationCount || 0) + 1 }
          : job
      ));
    } catch (err) {
      console.error("Error applying to job:", err);
      setAlert({ 
        type: 'error', 
        message: err.message || 'Failed to submit application. Please check your resume upload or permissions.'
      });
    }
  };

  const handleCancelApplication = async (jobId) => {
    try {
      const applicationId = applicationIds[jobId];
      if (!applicationId) {
        setAlert({ type: 'warning', message: 'No application found to cancel.' });
        return;
      }
      
      await cancelApplication(applicationId);
      setAppliedJobIds({ ...appliedJobIds, [jobId]: false });
      setApplicationIds({ ...applicationIds, [jobId]: null });
      setAlert({ type: 'success', message: 'Application cancelled successfully!' });

      // Update jobs list to reflect the reduced application count
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, applicationCount: Math.max((job.applicationCount || 0) - 1, 0) }
          : job
      ));
    } catch (err) {
      console.error("Error cancelling application:", err);
      setAlert({ 
        type: 'error', 
        message: err.message || 'Failed to cancel application. Please try again.'
      });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchLower) ||
      job.companyName?.toLowerCase().includes(searchLower) ||
      job.location?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-600 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} userRole={user ? "candidate" : null} />
      
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'warning' : 'default'} className="mb-4">
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Browse Jobs</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search jobs by title, company or location..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map(job => (
                <Card key={job.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h2 className="text-xl font-semibold">
                            <Link to={`/job/${job.id}`} className="hover:text-blue-600">
                              {job.title}
                            </Link>
                          </h2>
                          {user && (
                            <button 
                              onClick={() => handleSaveJob(job.id)}
                              className="ml-4 text-gray-500 hover:text-yellow-500"
                              aria-label={savedJobIds[job.id] ? "Unsave job" : "Save job"}
                            >
                              {savedJobIds[job.id] ? (
                                <BookmarkCheck className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <BookmarkPlus className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                          {job.companyName}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${job.minSalary} - ${job.maxSalary}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.type}
                          </div>
                          {job.postedAt && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Posted {new Date(job.postedAt.seconds * 1000).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requirements?.slice(0, 3).map((req, index) => (
                            <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
                              {req}
                            </span>
                          ))}
                          {job.requirements?.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 md:items-end md:ml-6 mt-4 md:mt-0">
                        {appliedJobIds[job.id] ? (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="text-green-700 border-green-700 hover:bg-green-50"
                              disabled
                            >
                              Applied
                            </Button>
                            <Button 
                              variant="outline" 
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleCancelApplication(job.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleApplyClick(job.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Apply Now
                          </Button>
                        )}
                        <Link to={`/job/${job.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        profile={profile}
        onApply={handleApplicationSubmit}
        currentResumeUrl={profile?.resumeUrl}
      />
      
      <Footer />
    </div>
  );
};

export default JobListing;