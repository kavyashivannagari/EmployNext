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
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  limit
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL as getStorageDownloadURL 
} from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsmnfX9sCFDmbXwj9F2J_3VDQ6BvHe8sQ",
  authDomain: "employnext-8bbd8.firebaseapp.com",
  projectId: "employnext-8bbd8",
  storageBucket: "employnext-8bbd8.appspot.com", // Fix the format
  messagingSenderId: "407213440123",
  appId: "1:407213440123:web:e876314164acedaefb36de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

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
    // Ensure we're authenticated
    checkUserAuth();
    
    const docRef = doc(db, "userProfiles", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    // Verify user is authenticated
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

export const updateUserProfileSaving = async (uid, data) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== uid) {
      throw new Error("You can only update your own profile");
    }
    
    const userRef = doc(db, "userProfiles", uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return { uid, ...data };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Job Functions
export const createJob = async (jobData) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    
    // Check if user is a recruiter
    const userRole = await getUserRole(user.uid);
    if (userRole !== "recruiter") {
      throw new Error("Only recruiters can create jobs");
    }
    
    const jobRef = await addDoc(collection(db, "jobs"), {
      ...jobData,
      recruiterId: user.uid, // Explicitly set the recruiter ID
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
    // Verify user is authenticated
    checkUserAuth();
    
    const jobSnapshot = await getDocs(collection(db, "jobs"));
    return jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting jobs:", error);
    // Provide user-friendly error messages
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view jobs. Please check your account status.");
    }
    throw error;
  }
};

export const getJobsByRecruiter = async (recruiterId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    console.log(user)
    const q = query(collection(db, "jobs"), where("recruiterId", "==", recruiterId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting recruiter jobs:", error);
    throw error;
  }
};

export const getJobById = async (jobId) => {
  try {
    // Verify user is authenticated
    checkUserAuth();
    
    const docRef = doc(db, "jobs", jobId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting job by ID:", error);
    throw error;
  }
};

export const updateJob = async (jobId, jobData) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    
    // Check if user is a recruiter
    const userRole = await getUserRole(user.uid);
    if (userRole !== "recruiter") {
      throw new Error("Only recruiters can update jobs");
    }
    
    // Get the job to verify ownership
    const jobDoc = await getJobById(jobId);
    if (!jobDoc) {
      throw new Error("Job not found");
    }
    
    // Check if this recruiter owns the job
    if (jobDoc.recruiterId !== user.uid) {
      throw new Error("You can only update your own job listings");
    }
    
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      ...jobData,
      updatedAt: serverTimestamp()
    });
    return { id: jobId, ...jobData };
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    
    // Check if user is a recruiter
    const userRole = await getUserRole(user.uid);
    if (userRole !== "recruiter") {
      throw new Error("Only recruiters can delete jobs");
    }
    
    // Get the job to verify ownership
    const jobDoc = await getJobById(jobId);
    if (!jobDoc) {
      throw new Error("Job not found");
    }
    
    // Check if this recruiter owns the job
    if (jobDoc.recruiterId !== user.uid) {
      throw new Error("You can only delete your own job listings");
    }
    
    await deleteDoc(doc(db, "jobs", jobId));
    return true;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

// Application Functions
export const applyToJob = async (userId, jobId, applicationData = {}) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("You can only apply with your own account");
    }
    
    // Check if user has already applied
    const existingApplications = await getUserApplicationsForJob(userId, jobId);
    if (existingApplications.length > 0) {
      throw new Error("You have already applied to this job");
    }
    
    // Create application document
    const applicationRef = await addDoc(collection(db, "applications"), {
      userId,
      jobId,
      status: 'pending',
      ...applicationData,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Atomically increment application count
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      applicationCount: increment(1)
    });

    return { id: applicationRef.id, userId, jobId, ...applicationData };
  } catch (error) {
    console.error("Error applying to job:", error);
    throw error;
  }
};

// Helper function to check if a user applied to a specific job
export const getUserApplicationsForJob = async (userId, jobId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("You can only view your own applications");
    }
    
    const q = query(
      collection(db, "applications"), 
      where("userId", "==", userId),
      where("jobId", "==", jobId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user applications for job:", error);
    throw error;
  }
};

export const getUserApplications = async (userId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("You can only view your own applications");
    }
    
    const q = query(collection(db, "applications"), where("userId", "==", userId), limit(50));
    const querySnapshot = await getDocs(q);
    
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch job details for each application
    const applicationsWithJobs = await Promise.all(
      applications.map(async (app) => ({
        ...app,
        job: await getJobById(app.jobId)
      }))
    );
    
    return applicationsWithJobs;
  } catch (error) {
    console.error("Error getting user applications:", error);
    throw error;
  }
};

export const getJobApplications = async (jobId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    
    // Check if user is a recruiter
    const userRole = await getUserRole(user.uid);
    if (userRole !== "recruiter") {
      throw new Error("Only recruiters can view job applications");
    }
    
    // Get the job to verify ownership
    const jobDoc = await getJobById(jobId);
    if (!jobDoc) {
      throw new Error("Job not found");
    }
    
    // Check if this recruiter owns the job
    if (jobDoc.recruiterId !== user.uid) {
      throw new Error("You can only view applications for your own job listings");
    }
    
    const q = query(collection(db, "applications"), where("jobId", "==", jobId), limit(100));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting job applications:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    
    // Check if user is a recruiter
    const userRole = await getUserRole(user.uid);
    if (userRole !== "recruiter") {
      throw new Error("Only recruiters can update application status");
    }
    
    // Get the application
    const applicationRef = doc(db, "applications", applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error("Application not found");
    }
    
    const applicationData = applicationSnap.data();
    
    // Get the job to verify ownership
    const jobDoc = await getJobById(applicationData.jobId);
    if (!jobDoc) {
      throw new Error("Associated job not found");
    }
    
    // Check if this recruiter owns the job
    if (jobDoc.recruiterId !== user.uid) {
      throw new Error("You can only update applications for your own job listings");
    }
    
    await updateDoc(applicationRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { id: applicationId, status };
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

// Saved Jobs Functions
export const saveJob = async (userId, jobId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("You can only save jobs to your own account");
    }
    
    // Check if the job exists
    const jobDoc = await getJobById(jobId);
    if (!jobDoc) {
      throw new Error("Job not found");
    }
    
    // Check if already saved
    const isSaved = await isJobSaved(userId, jobId);
    if (isSaved) {
      // Already saved, just return the info
      return { userId, jobId };
    }
    
    // Save the job
    const savedJobRef = await addDoc(collection(db, "savedJobs"), {
      userId,
      jobId,
      savedAt: serverTimestamp()
    });
    
    return { id: savedJobRef.id, userId, jobId };
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

export const unsaveJob = async (userId, jobId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("You can only unsave jobs from your own account");
    }
    
    const q = query(
      collection(db, "savedJobs"),
      where("userId", "==", userId),
      where("jobId", "==", jobId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, "savedJobs", querySnapshot.docs[0].id));
    }
    return true;
  } catch (error) {
    console.error("Error unsaving job:", error);
    throw error;
  }
};

export const getSavedJobs = async (userId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("You can only view your own saved jobs");
    }
    
    const q = query(collection(db, "savedJobs"), where("userId", "==", userId), limit(50));
    const querySnapshot = await getDocs(q);
    
    const savedJobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch job details for each saved job
    const savedJobsWithDetails = await Promise.all(
      savedJobs.map(async (savedJob) => ({
        ...savedJob,
        job: await getJobById(savedJob.jobId)
      }))
    );
    
    return savedJobsWithDetails;
  } catch (error) {
    console.error("Error getting saved jobs:", error);
    throw error;
  }
};

export const isJobSaved = async (userId, jobId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("You can only check saved status for your own account");
    }
    
    const q = query(
      collection(db, "savedJobs"),
      where("userId", "==", userId),
      where("jobId", "==", jobId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if job is saved:", error);
    // Return false instead of throwing to handle gracefully in UI
    return false;
  }
};

// Role Management
export const registerWithEmailAndPasswordWithRole = async (name, email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    
    // Store user data with role
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error("Error in registration:", error);
    throw error;
  }
};

export const getUserRole = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().role : null;
  } catch (error) {
    console.error("Error getting user role:", error);
    throw error;
  }
};

// Storage Functions
export const uploadResume = async (userId, file, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      // Verify user is authenticated
      const user = checkUserAuth();
      if (user.uid !== userId) {
        throw new Error("You can only upload to your own account");
      }
      
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `resumes/${userId}/${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getStorageDownloadURL(uploadTask.snapshot.ref);
          
          // Optional: Update user profile with the new resume URL
          try {
            await updateUserProfileSaving(userId, {
              resumeUrl: downloadURL,
              updatedAt: serverTimestamp()
            });
          } catch (updateError) {
            console.error('Error updating profile with resume:', updateError);
            // Continue and return the URL even if profile update fails
          }
          
          resolve(downloadURL);
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      reject(error);
    }
  });
};

export const getDownloadURL = async (path) => {
  try {
    // Verify user is authenticated
    checkUserAuth();
    
    const fileRef = ref(storage, path);
    return await getStorageDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

export const cancelApplication = async (applicationId) => {
  try {
    // Verify user is authenticated
    const user = checkUserAuth();
    
    // Get the application
    const applicationRef = doc(db, "applications", applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error("Application not found");
    }
    
    const applicationData = applicationSnap.data();
    
    // Check if this user owns the application
    if (applicationData.userId !== user.uid) {
      throw new Error("You can only cancel your own applications");
    }
    
    await deleteDoc(applicationRef);
    
    // Decrement application count for the job
    const jobRef = doc(db, "jobs", applicationData.jobId);
    await updateDoc(jobRef, {
      applicationCount: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error("Error cancelling application:", error);
    throw error;
  }
};

// Export core services
export { auth, db, storage };