import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, getUserRole } from '../lib/firebase';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const MyJobs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  
  // For recruiters
  const [postedJobs, setPostedJobs] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  // For candidates
  const [appliedJobs, setAppliedJobs] = useState([]);
  
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        const role = await getUserRole(currentUser.uid);
        setUserRole(role);
        
        if (role === 'recruiter') {
          fetchPostedJobs(currentUser.uid);
        } else if (role === 'candidate') {
          fetchAppliedJobs(currentUser.uid);
        }
      } catch (error) {
        console.error('Error getting user role:', error);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const fetchPostedJobs = async (userId) => {
    try {
      setLoading(true);
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('postedBy', '==', userId)
      );
      
      const snapshot = await getDocs(jobsQuery);
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPostedJobs(jobs);
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAppliedJobs = async (userId) => {
    try {
      setLoading(true);
      
      // Get user's applied job IDs
      const userDoc = await getDocs(doc(db, 'users', userId));
      
      if (!userDoc.exists() || !userDoc.data().appliedJobs || userDoc.data().appliedJobs.length === 0) {
        setAppliedJobs([]);
        setLoading(false);
        return;
      }
      
      const appliedJobIds = userDoc.data().appliedJobs;
      
      // Fetch each job document
      const jobPromises = appliedJobIds.map(jobId => getDocs(doc(db, 'jobs', jobId)));
      const jobDocs = await Promise.all(jobPromises);
      
      // Process job documents
      const jobsData = jobDocs
        .filter(doc => doc.exists())
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          applicationStatus: 'Pending' // Default status
        }));
      
      setAppliedJobs(jobsData);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleJobActiveStatus = async (jobId, currentStatus) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        active: !currentStatus
      });
      
      // Update local state
      setPostedJobs(postedJobs.map(job => 
        job.id === jobId ? {...job, active: !job.active} : job
      ));
      
      // Removed toast notification
      console.log(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };
  
  const openDeleteDialog = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'jobs', jobToDelete.id));
      
      // Update local state
      setPostedJobs(postedJobs.filter(job => job.id !== jobToDelete.id));
      
      // Removed toast notification
      console.log(`"${jobToDelete.title}" has been deleted.`);
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Jobs</h1>
      
      {userRole === 'recruiter' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">Manage your posted job listings</p>
            <Link to="/postjob">
              <Button>Post New Job</Button>
            </Link>
          </div>
          
          {postedJobs.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold">No jobs posted yet</h3>
              <p className="text-muted-foreground mt-2">
                Create your first job posting to start receiving applications.
              </p>
              <Link to="/postjob">
                <Button className="mt-6">Post a Job</Button>
              </Link>
            </div>
          ) : (
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active Jobs</TabsTrigger>
                <TabsTrigger value="inactive">Inactive Jobs</TabsTrigger>
                <TabsTrigger value="all">All Jobs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <div className="space-y-4">
                  {postedJobs.filter(job => job.active).map(job => renderRecruiterJobCard(job))}
                  {postedJobs.filter(job => job.active).length === 0 && (
                    <p className="text-center py-4">No active jobs found</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="inactive">
                <div className="space-y-4">
                  {postedJobs.filter(job => !job.active).map(job => renderRecruiterJobCard(job))}
                  {postedJobs.filter(job => !job.active).length === 0 && (
                    <p className="text-center py-4">No inactive jobs found</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {postedJobs.map(job => renderRecruiterJobCard(job))}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Job</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteJob}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        // Candidate view for applied jobs
        <>
          <p className="text-muted-foreground mb-6">Track your job applications</p>
          
          {appliedJobs.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold">No job applications found</h3>
              <p className="text-muted-foreground mt-2">
                Start applying for jobs to track your applications here.
              </p>
              <Link to="/jobs">
                <Button className="mt-6">Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appliedJobs.map(job => renderCandidateJobCard(job))}
            </div>
          )}
        </>
      )}
    </div>
  );
  
  function renderRecruiterJobCard(job) {
    return (
      <Card key={job.id} className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-xl">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>{job.location}</Badge>
                <Badge variant="outline">{job.jobType}</Badge>
                {job.active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {job.postedDate && new Date(job.postedDate.toDate()).toLocaleDateString()}
              <div className="mt-1">
                <Badge variant="outline">
                  {job.applicants?.length || 0} Applicant{(job.applicants?.length || 0) !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="flex gap-2">
            <Link to={`/job/${job.id}`}>
              <Button variant="ghost">View Details</Button>
            </Link>
            <Link to={`/job/${job.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={job.active ? "destructive" : "outline"} 
              onClick={() => toggleJobActiveStatus(job.id, job.active)}
            >
              {job.active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-500 hover:text-red-700"
              onClick={() => openDeleteDialog(job)}
            >
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  function renderCandidateJobCard(job) {
    return (
      <Card key={job.id} className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-xl">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>{job.location}</Badge>
                <Badge variant="outline">{job.jobType}</Badge>
                <Badge variant="secondary">{job.applicationStatus}</Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Applied on: {job.appliedDate ? new Date(job.appliedDate.toDate()).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <Link to={`/job/${job.id}`}>
            <Button variant="ghost">View Job</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
};

export default MyJobs;