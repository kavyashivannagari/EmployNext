import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const JobPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkSavedStatus(currentUser.uid);
        checkAppliedStatus(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', id));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Error fetching job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const checkSavedStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().savedJobs) {
        setIsSaved(userDoc.data().savedJobs.includes(id));
      }
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const checkAppliedStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().appliedJobs) {
        setIsApplied(userDoc.data().appliedJobs.includes(id));
      }
    } catch (err) {
      console.error('Error checking applied status:', err);
    }
  };

  const toggleSaveJob = async () => {
    if (!user) {
      // Redirect to login if not logged in
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      
      if (isSaved) {
        // Remove from saved jobs
        await updateDoc(userRef, {
          savedJobs: arrayRemove(id)
        });
        setIsSaved(false);
      } else {
        // Add to saved jobs
        await updateDoc(userRef, {
          savedJobs: arrayUnion(id)
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error updating saved jobs:', err);
    }
  };

  const applyForJob = async () => {
    if (!user) {
      // Redirect to login if not logged in
      return;
    }

    try {
      // Update user's applied jobs
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        appliedJobs: arrayUnion(id)
      });

      // Update job's applicants
      const jobRef = doc(db, 'jobs', id);
      await updateDoc(jobRef, {
        applicants: arrayUnion(user.uid)
      });

      setIsApplied(true);
    } catch (err) {
      console.error('Error applying for job:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">{error}</h2>
          <Link to="/jobs" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/jobs" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to Job Listings
      </Link>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{job.title}</CardTitle>
              <CardDescription className="text-xl mt-2">{job.company}</CardDescription>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge>{job.location}</Badge>
                <Badge variant="outline">{job.jobType}</Badge>
                <Badge variant="secondary">${job.salary}</Badge>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant={isSaved ? "outline" : "secondary"}
                onClick={toggleSaveJob}
              >
                {isSaved ? "Unsave" : "Save Job"}
              </Button>
              
              <Button
                disabled={isApplied}
                onClick={applyForJob}
              >
                {isApplied ? "Applied" : "Apply Now"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Job Description</h3>
            <p className="whitespace-pre-line">{job.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Requirements</h3>
            <ul className="list-disc ml-5 space-y-1">
              {job.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Benefits</h3>
            <ul className="list-disc ml-5 space-y-1">
              {job.benefits?.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-6">
          <div className="w-full">
            <p className="text-sm text-muted-foreground">Posted on {new Date(job.postedDate?.toDate()).toLocaleDateString()}</p>
            <Button className="mt-4 w-full md:w-auto" disabled={isApplied} onClick={applyForJob}>
              {isApplied ? "Applied" : "Apply Now"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobPage;