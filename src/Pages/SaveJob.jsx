// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { auth, getSavedJobs, unsaveJob } from '../lib/firebase';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Briefcase, MapPin, DollarSign, Clock, BookmarkX } from 'lucide-react';

// const SavedJobs = () => {
//   const [savedJobs, setSavedJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSavedJobs = async () => {
//       try {
//         const user = auth.currentUser;
//         if (!user) {
//           setError("You need to be logged in to view saved jobs");
//           setLoading(false);
//           return;
//         }

//         const jobs = await getSavedJobs(user.uid);
//         setSavedJobs(jobs);
//       } catch (err) {
//         console.error("Error fetching saved jobs:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSavedJobs();
//   }, []);

//   const handleUnsave = async (savedJobId, jobId) => {
//     try {
//       const user = auth.currentUser;
//       if (!user) return;

//       await unsaveJob(user.uid, jobId);
//       setSavedJobs(savedJobs.filter(job => job.id !== savedJobId));
//     } catch (err) {
//       console.error("Error unsaving job:", err);
//       alert("Failed to remove job. Please try again.");
//     }
//   };

//   const handleApply = (companyUrl) => {
//     window.open(companyUrl, '_blank');
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="bg-red-50 dark:bg-red-900/20 border border-red-600 p-4 rounded-md">
//           <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error</h2>
//           <p className="text-red-700 dark:text-red-300">{error}</p>
//           <Link to="/login" className="text-blue-600 hover:underline mt-4 inline-block">
//             Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header user={auth.currentUser} userRole="candidate" />
      
//       <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-6xl mx-auto">
//           <div className="mb-6 flex justify-between items-center">
//             <h1 className="text-2xl font-bold">Saved Jobs</h1>
//             <Link to="/jobs">
//               <Button variant="outline">Browse Jobs</Button>
//             </Link>
//           </div>
          
//           {savedJobs.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500 mb-4">You haven't saved any jobs yet.</p>
//               <Link to="/jobs">
//                 <Button>Browse Jobs</Button>
//               </Link>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {savedJobs.map(savedJob => {
//                 const job = savedJob.job;
//                 if (!job) return null;
                
//                 return (
//                   <Card key={savedJob.id} className="overflow-hidden">
//                     <CardContent className="p-6">
//                       <div className="flex flex-col md:flex-row justify-between">
//                         <div className="flex-1">
//                           <h2 className="text-xl font-semibold">
//                             <Link to={`/job/${job.id}`} className="hover:text-blue-600">
//                               {job.title}
//                             </Link>
//                           </h2>
                          
//                           <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-2">
//                             {job.companyName}
//                           </h3>
                          
//                           <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
//                             <div className="flex items-center">
//                               <MapPin className="h-4 w-4 mr-1" />
//                               {job.location}
//                             </div>
//                             <div className="flex items-center">
//                               <DollarSign className="h-4 w-4 mr-1" />
//                               ${job.minSalary} - ${job.maxSalary}
//                             </div>
//                             <div className="flex items-center">
//                               <Briefcase className="h-4 w-4 mr-1" />
//                               {job.type}
//                             </div>
//                             {job.postedAt && (
//                               <div className="flex items-center">
//                                 <Clock className="h-4 w-4 mr-1" />
//                                 Posted {new Date(job.postedAt.seconds * 1000).toLocaleDateString()}
//                               </div>
//                             )}
//                           </div>
                          
//                           <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
//                             {job.description}
//                           </p>
//                         </div>
                        
//                         <div className="flex flex-col gap-2 md:items-end md:ml-6 mt-4 md:mt-0">
//                           <Button 
//                             onClick={() => handleApply(job.companyUrl)}
//                             className="bg-green-600 hover:bg-green-700"
//                           >
//                             Apply Now
//                           </Button>
//                           <Button 
//                             variant="outline" 
//                             className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
//                             onClick={() => handleUnsave(savedJob.id, job.id)}
//                           >
//                             <BookmarkX className="h-4 w-4 mr-2" />
//                             Remove
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </main>
      
//       <Footer />
//     </div>
//   );
// };

// export default SavedJobs;




import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  auth, 
  getSavedJobs, 
  unsaveJob, 
  applyToJob, 
  getUserProfile,
  cancelApplication
} from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, MapPin, DollarSign, Clock, BookmarkX, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState({});
  const [applicationIds, setApplicationIds] = useState({});
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You need to be logged in to view saved jobs");
          setLoading(false);
          return;
        }

        const jobs = await getSavedJobs(user.uid);
        setSavedJobs(jobs);

        // Track applied jobs and their application IDs
        const appliedIds = {};
        const appIds = {};
        jobs.forEach(job => {
          if (job.applicationId) {
            appliedIds[job.id] = true;
            appIds[job.id] = job.applicationId;
          }
        });
        setAppliedJobIds(appliedIds);
        setApplicationIds(appIds);
      } catch (err) {
        console.error("Error fetching saved jobs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleUnsave = async (savedJobId, jobId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await unsaveJob(user.uid, jobId);
      setSavedJobs(savedJobs.filter(job => job.id !== savedJobId));
    } catch (err) {
      console.error("Error unsaving job:", err);
      setAlert({ type: 'error', message: 'Failed to remove job. Please try again.' });
    }
  };

  const handleApply = async (jobId) => {
    if (!auth.currentUser) {
      navigate('/login', { state: { from: `/saved-jobs` } });
      return;
    }

    try {
      // Check if profile is complete
      const profile = await getUserProfile(auth.currentUser.uid);
      if (!profile?.fullName || !profile?.skills || !profile?.resumeUrl) {
        setAlert({ 
          type: 'error', 
          message: 'Please complete your profile with resume before applying' 
        });
        navigate('/candidate-profile');
        return;
      }

      // Apply to job
      const applicationId = await applyToJob(auth.currentUser.uid, jobId);
      setAppliedJobIds({...appliedJobIds, [jobId]: true});
      setApplicationIds({...applicationIds, [jobId]: applicationId});
      setAlert({ type: 'success', message: 'Application submitted successfully!' });
    } catch (err) {
      console.error("Error applying to job:", err);
      setAlert({ type: 'error', message: err.message || 'Failed to apply. Please try again.' });
    }
  };

  const handleCancelApplication = async (jobId) => {
    try {
      const applicationId = applicationIds[jobId];
      if (!applicationId) return;
      
      await cancelApplication(applicationId);
      setAppliedJobIds({...appliedJobIds, [jobId]: false});
      setAlert({ type: 'success', message: 'Application cancelled successfully!' });
    } catch (err) {
      console.error("Error cancelling application:", err);
      setAlert({ type: 'error', message: 'Failed to cancel application. Please try again.' });
    }
  };

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
          <Link to="/login" className="text-blue-600 hover:underline mt-4 inline-block">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={auth.currentUser} userRole="candidate" />
      
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Saved Jobs</h1>
            <Link to="/jobs">
              <Button variant="outline">Browse Jobs</Button>
            </Link>
          </div>
          
          {savedJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't saved any jobs yet.</p>
              <Link to="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedJobs.map(savedJob => {
                const job = savedJob.job;
                if (!job) return null;
                
                return (
                  <Card key={savedJob.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold">
                            <Link to={`/job/${job.id}`} className="hover:text-blue-600">
                              {job.title}
                            </Link>
                          </h2>
                          
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
                              onClick={() => handleApply(job.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Apply Now
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleUnsave(savedJob.id, job.id)}
                          >
                            <BookmarkX className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SavedJobs;