import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  runTransaction,
  enableIndexedDbPersistence
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsmnfX9sCFDmbXwj9F2J_3VDQ6BvHe8sQ",
  authDomain: "employnext-8bbd8.firebaseapp.com",
  projectId: "employnext-8bbd8",
  storageBucket: "employnext-8bbd8.appspot.com",
  messagingSenderId: "407213440123",
  appId: "1:407213440123:web:e876314164acedaefb36de"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Enable persistence with the correct function
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firebase persistence failed - multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("Firebase persistence not available in this browser");
    }
  });
} catch (error) {
  console.error("Firebase initialization error", error);
  throw error;
}

const googleProvider = new GoogleAuthProvider();

// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: "dmjnyha0e",
  apiKey: "228262763351283",
  uploadPreset: "resumes_preset"
};

// Auth Helper Function
export const checkUserAuth = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
};

// Role Management Helper
export const setUserRole = async (uid, role) => {
  try {
    await setDoc(doc(db, "users", uid), {
      role,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

// Authentication Functions
export const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    return user;
  } catch (error) {
    console.error("Error in registration:", error);
    throw error;
  }
};

export const registerWithEmailAndPasswordWithRole = async (name, email, password, role) => {
  try {
    const userCredential = await registerWithEmailAndPassword(name, email, password);
    const user = userCredential.user;

    await setUserRole(user.uid, role);
    return user;
  } catch (error) {
    console.error("Error in registration with role:", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error in login:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error in Google sign-in:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error in logout:", error);
    throw error;
  }
};

// User Profile Functions
export const createUserProfile = async (uid, data) => {
  try {
    await setDoc(doc(db, "userProfiles", uid), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { uid, ...data };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const docRef = doc(db, "userProfiles", uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log("No profile found for user:", uid);
      return null;
    }
    
    return { uid, ...docSnap.data() };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    const user = checkUserAuth(); 
    if (user.uid !== uid) {
      throw new Error("You can only update your own profile");
    }
    
    const userRef = doc(db, "userProfiles", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { uid, ...data };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Job Functions
export const createJob = async (jobData) => {
  try {
    const user = checkUserAuth();
    const userRole = await getUserRole(user.uid);
    if (userRole !== "recruiter") {
      throw new Error("Only recruiters can create jobs");
    }
    
    const jobRef = await addDoc(collection(db, "jobs"), {
      ...jobData,
      recruiterId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      applicationCount: 0
    });
    return { id: jobRef.id, ...jobData };
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const getJobs = async () => {
  try {
    checkUserAuth();
    const jobSnapshot = await getDocs(collection(db, "jobs"));
    return jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting jobs:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view jobs. Please check your account status.");
    }
    throw error;
  }
};

export const getJobById = async (jobId) => {
  try {
    checkUserAuth();
    const docRef = doc(db, "jobs", jobId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting job by ID:", error);
    throw error;
  }
};

// Saved Jobs Functions
export const getSavedJobs = async (userId) => {
  try {
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("Authentication mismatch");
    }

    // Get saved job IDs
    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (!savedJobDoc.exists()) {
      return [];
    }

    const savedJobIds = savedJobDoc.data().jobs || [];
    if (savedJobIds.length === 0) {
      return [];
    }

    // Get job details for each saved job
    const jobsPromises = savedJobIds.map(jobId => getJobById(jobId));
    const jobs = await Promise.all(jobsPromises);

    // Check application status for each job
    const applicationsQuery = query(
      collection(db, "applications"),
      where("userId", "==", userId),
      where("jobId", "in", savedJobIds)
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    const applicationsMap = {};
    applicationsSnapshot.forEach(doc => {
      applicationsMap[doc.data().jobId] = doc.id;
    });

    // Combine the data
    return jobs.filter(job => job !== null).map(job => ({
      id: `${userId}_${job.id}`, // Create a unique ID for the saved job reference
      job,
      applicationId: applicationsMap[job.id] || null
    }));
  } catch (error) {
    console.error("Error getting saved jobs:", error);
    throw error;
  }
};

export const isJobSaved = async (userId, jobId) => {
  try {
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("Authentication mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (savedJobDoc.exists()) {
      const savedJobs = savedJobDoc.data().jobs || [];
      return savedJobs.includes(jobId);
    }
    
    return false;
  } catch (error) {
    console.error("Error checking saved job status:", error);
    throw error;
  }
};

export const saveJob = async (userId, jobId) => {
  try {
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("Authentication mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (savedJobDoc.exists()) {
      const existingJobs = savedJobDoc.data().jobs || []; // Fallback to empty array
      await updateDoc(savedJobRef, {
        jobs: [...new Set([...existingJobs, jobId])],
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(savedJobRef, {
        jobs: [jobId],
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

export const unsaveJob = async (userId, jobId) => {
  try {
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("Authentication mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (savedJobDoc.exists()) {
      const savedJobs = savedJobDoc.data().jobs || [];
      const updatedJobs = savedJobs.filter(id => id !== jobId);
      
      await updateDoc(savedJobRef, {
        jobs: updatedJobs,
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error removing saved job:", error);
    throw error;
  }
};

// Application Functions
export const getUserApplications = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }
    
    const q = query(collection(db, "applications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    // Get job details for each application
    const applicationsWithJobs = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const appData = doc.data();
        let jobData = {};
        
        try {
          const jobDoc = await getDoc(doc(db, "jobs", appData.jobId));
          if (jobDoc.exists()) {
            jobData = jobDoc.data();
          }
        } catch (jobError) {
          console.error("Error fetching job data:", jobError);
        }
        
        return {
          id: doc.id,
          ...appData,
          job: jobData
        };
      })
    );
    
    return applicationsWithJobs;
  } catch (error) {
    console.error("Error getting user applications:", error);
    throw error;
  }
};

export const applyToJob = async (userId, jobId, applicationData = {}) => {
  try {
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("Authentication mismatch");
    }

    // Check if already applied
    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, 
      where("userId", "==", userId), 
      where("jobId", "==", jobId)
    );
    
    const existingApplication = await getDocs(q);
    if (!existingApplication.empty) {
      throw new Error("You have already applied to this job");
    }

    // Create application
    const applicationRef = await addDoc(collection(db, "applications"), {
      userId,
      jobId,
      status: "pending",
      appliedAt: serverTimestamp(),
      ...applicationData
    });

    // Update job application count
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      applicationCount: increment(1)
    });

    return applicationRef.id;
  } catch (error) {
    console.error("Error applying to job:", error);
    throw error;
  }
};

export const cancelApplication = async (applicationId) => {
  try {
    const user = checkUserAuth();
    
    // Get the application to check ownership and get jobId
    const applicationRef = doc(db, "applications", applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error("Application not found");
    }
    
    const applicationData = applicationSnap.data();
    
    // Check if user owns this application
    if (applicationData.userId !== user.uid) {
      throw new Error("You can only cancel your own applications");
    }
    
    // Get the job ID to update application count
    const jobId = applicationData.jobId;
    
    // Update job application count (decrement by 1)
    const jobRef = doc(db, "jobs", jobId);
    
    // Use a transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      const jobDoc = await transaction.get(jobRef);
      if (!jobDoc.exists()) {
        throw new Error("Job not found");
      }
      
      const currentCount = jobDoc.data().applicationCount || 0;
      const newCount = Math.max(0, currentCount - 1); // Ensure count doesn't go below 0
      
      transaction.update(jobRef, { applicationCount: newCount });
      transaction.delete(applicationRef);
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling application:', error);
    throw error;
  }
};

// Role Management
export const getUserRole = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const role = docSnap.data().role;
      console.log(`Fetched role for UID ${uid}: ${role}`);
      return role || null; // Return null if role is missing
    } else {
      console.log(`No user document found for UID ${uid}`);
      return null; // No document exists
    }
  } catch (error) {
    console.error(`Error fetching user role for UID ${uid}:`, error);
    return null; // Return null on error
  }
};

export const getJobsByRecruiter = async (recruiterId) => {
  try {
    checkUserAuth();
    const q = query(collection(db, "jobs"), where("recruiterId", "==", recruiterId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting recruiter jobs:", error);
    throw error;
  }
};

// Function to upload a resume
export const uploadResume = async (userId, resumeFile) => {
  try {
    // This is a placeholder for whatever upload method you're using
    // You would typically upload the file to cloud storage and get a URL
    console.log(`Resume upload would happen here for user ${userId}`, resumeFile);
    return "https://example.com/resume.pdf"; // Replace with actual upload logic
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
};

// Export core services
export { 
  auth, 
  db, 
  googleProvider,
};