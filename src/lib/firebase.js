import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile as updateAuthProfile,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
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
  runTransaction
} from "firebase/firestore";
import axios from 'axios';

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: "dmjnyha0e",
  apiKey: "228262763351283",
  uploadPreset: "resumes_preset"
};

// Cloudinary Resume Upload Function
export const uploadResume = async (userId, resumeFile) => {
  try {
    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(resumeFile.type)) {
      throw new Error('Only PDF, DOC, and DOCX files are allowed');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (resumeFile.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);
    formData.append('public_id', `resumes/${userId}_${Date.now()}`);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      }
    );

    if (response.data && response.data.secure_url) {
      // Update user profile with the new resume URL
      await updateUserProfile(userId, { resumeUrl: response.data.secure_url });
      return response.data.secure_url;
    }

    throw new Error('Failed to upload resume to Cloudinary');
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
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
    
    await updateAuthProfile(user, { displayName: name });
    return user;
  } catch (error) {
    console.error("Error in registration:", error);
    throw error;
  }
};

export const registerWithEmailAndPasswordWithRole = async (name, email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateAuthProfile(user, { displayName: name });
    await setUserRole(user.uid, role);
    
    await createUserProfile(user.uid, {
      fullName: name,
      companyName: '',
      position: '',
      location: '',
      industry: '',
      companyWebsite: '',
      companyDescription: '',
      resumeUrl: ''
    });
    
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
    const user = result.user;
    
    try {
      await getUserProfile(user.uid);
    } catch {
      await createUserProfile(user.uid, {
        fullName: user.displayName || '',
        companyName: '',
        position: '',
        location: '',
        industry: '',
        companyWebsite: '',
        companyDescription: '',
        resumeUrl: ''
      });
    }
    
    return user;
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
    const docRef = doc(db, "userProfiles", uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Profile not found");
    }
    
    return docSnap.data();
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
      applicationCount: 0,
      status: "active"
    });
    return { id: jobRef.id, ...jobData };
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const getJobs = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");
    
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
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");
    
    const docRef = doc(db, "jobs", jobId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting job by ID:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view this job. Please check your account status.");
    }
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  try {
    const user = checkUserAuth();
    
    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      throw new Error("Job not found");
    }
    
    if (jobSnap.data().recruiterId !== user.uid) {
      throw new Error("You can only delete your own job postings");
    }
    
    await deleteDoc(jobRef);
    
    const applicationsQuery = query(
      collection(db, "applications"),
      where("jobId", "==", jobId)
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    const deletePromises = applicationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

export const getJobsByRecruiter = async (recruiterId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");
    
    const q = query(collection(db, "jobs"), where("recruiterId", "==", recruiterId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting recruiter jobs:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view these jobs. Please check your account status.");
    }
    throw error;
  }
};

// Saved Jobs Functions
export const saveJob = async (userId, jobId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    let savedJobs = [];
    if (savedJobDoc.exists()) {
      savedJobs = savedJobDoc.data().jobs || [];
      if (savedJobs.includes(jobId)) {
        return; // already saved
      }
    }
    
    savedJobs.push(jobId);
    await setDoc(savedJobRef, { jobs: savedJobs }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

export const unsaveJob = async (userId, jobId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (savedJobDoc.exists()) {
      let savedJobs = savedJobDoc.data().jobs || [];
      savedJobs = savedJobs.filter(id => id !== jobId);
      await setDoc(savedJobRef, { jobs: savedJobs }, { merge: true });
    }
    
    return true;
  } catch (error) {
    console.error("Error unsaving job:", error);
    throw error;
  }
};

export const isJobSaved = async (userId, jobId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
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

export const getSavedJobs = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (!savedJobDoc.exists()) {
      return [];
    }

    const savedJobIds = savedJobDoc.data().jobs || [];
    if (savedJobIds.length === 0) {
      return [];
    }

    const jobsPromises = savedJobIds.map(async (jobId) => {
      const jobDoc = await getDoc(doc(db, "jobs", jobId));
      if (!jobDoc.exists()) {
        return null;
      }

      let applicationId = null;
      const applicationsQuery = query(
        collection(db, "applications"),
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      if (!applicationsSnapshot.empty) {
        applicationId = applicationsSnapshot.docs[0].id;
      }

      return {
        id: jobId,
        job: { id: jobDoc.id, ...jobDoc.data() },
        applicationId
      };
    });

    const jobs = await Promise.all(jobsPromises);
    return jobs.filter(job => job !== null);
  } catch (error) {
    console.error("Error getting saved jobs:", error);
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
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user applications:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view applications. Please check your account status.");
    }
    throw error;
  }
};

export const applyToJob = async (userId, jobId, applicationData = {}) => {
  try {
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("Authentication mismatch");
    }

    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, 
      where("userId", "==", userId), 
      where("jobId", "==", jobId)
    );
    
    const existingApplication = await getDocs(q);
    if (!existingApplication.empty) {
      throw new Error("You have already applied to this job");
    }

    const applicationRef = await addDoc(collection(db, "applications"), {
      userId,
      jobId,
      status: "pending",
      appliedAt: serverTimestamp(),
      ...applicationData
    });

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
    
    const applicationRef = doc(db, "applications", applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error("Application not found");
    }
    
    const applicationData = applicationSnap.data();
    
    if (applicationData.userId !== user.uid) {
      throw new Error("You can only cancel your own applications");
    }
    
    const jobId = applicationData.jobId;
    const jobRef = doc(db, "jobs", jobId);
    
    await runTransaction(db, async (transaction) => {
      const jobDoc = await transaction.get(jobRef);
      if (!jobDoc.exists()) {
        throw new Error("Job not found");
      }
      
      const currentCount = jobDoc.data().applicationCount || 0;
      const newCount = Math.max(0, currentCount - 1);
      
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
      return docSnap.data().role || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user role for UID ${uid}:`, error);
    return null;
  }
};

// Modified Guest Recruiter Login Function
export const loginAsRecruiterGuest = async () => {
  try {
    // Use a predefined email and password for the guest recruiter account
    const email = "guest-recruiter@employnext.com";
    const password = "guestrecruiter123";
    
    try {
      // Try to login with the guest account
      console.log("Attempting to log in as guest recruiter");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Guest login successful");
      return userCredential.user;
    } catch (authError) {
      console.error("Initial login attempt failed:", authError.code, authError.message);
      
      // If the account doesn't exist or credential is invalid, create a new one
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
        console.log("Creating new guest account");
        // First, check if user with this email exists but has wrong credentials
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          console.log("Sign-in methods for email:", methods);
          if (methods && methods.length > 0) {
            throw new Error("Guest account exists but password may be incorrect");
          }
        } catch (checkError) {
          console.error("Error checking email:", checkError);
        }
        
        // Try creating new account
        console.log("Attempting to create new guest account");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Set display name
        console.log("Setting display name for guest account");
        await updateAuthProfile(user, { displayName: "Guest Recruiter" });
        
        // Set user role to recruiter
        console.log("Setting role for guest account");
        await setUserRole(user.uid, "recruiter");
        
        // Create a basic profile
        console.log("Creating profile for guest account");
        await createUserProfile(user.uid, {
          fullName: "Guest Recruiter",
          companyName: "Demo Company Inc.",
          position: "HR Manager",
          location: "Remote",
          industry: "Technology",
          companyWebsite: "www.democompany.com",
          companyDescription: "This is a demo recruiter account for guests to explore the platform.",
          resumeUrl: ''
        });
        
        console.log("Guest account created successfully");
        return user;
      } else {
        console.error("Unhandled auth error:", authError);
        throw authError;
      }
    }
  } catch (error) {
    console.error("Critical error in guest recruiter login:", error);
    throw error;
  }
};

export { auth, db, googleProvider };