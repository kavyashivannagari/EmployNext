// import { initializeApp } from "firebase/app";
// import { 
//     getAuth, 
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword, 
//     signOut, 
//     updateProfile,
//     GoogleAuthProvider,
//     signInWithPopup
//   } from "firebase/auth";
//   import { 
//     getFirestore, 
//     doc, 
//     setDoc, 
//     getDoc,
//     collection,
//     addDoc,
//     updateDoc,
//     deleteDoc,
//     query,
//     where,
//     getDocs,
//     serverTimestamp
//   } from "firebase/firestore";
// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyAsmnfX9sCFDmbXwj9F2J_3VDQ6BvHe8sQ",
//     authDomain: "employnext-8bbd8.firebaseapp.com",
//     projectId: "employnext-8bbd8",
//     storageBucket: "employnext-8bbd8.firebasestorage.app",
//     messagingSenderId: "407213440123",
//     appId: "1:407213440123:web:e876314164acedaefb36de"
//   };

//   // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const googleProvider = new GoogleAuthProvider();

// export const registerWithEmailAndPassword = async (name, email, password) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
      
//       // Update profile with display name
//       await updateProfile(user, {
//         displayName: name
//       });
      
//       return user;
//     } catch (error) {
//       console.error("Error in registration:", error);
//       throw error;
//     }
//   };
//   export const loginWithEmailAndPassword = async (email, password) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       return userCredential.user;
//     } catch (error) {
//       console.error("Error in login:", error);
//       throw error;
//     }
//   };
//   export const signInWithGoogle = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       return result.user;
//     } catch (error) {
      
//       console.error("Error in Google sign-in:", error);
//       throw error;
//     }
//   };
//   export const logoutUser = async () => {
//     try {
//       await signOut(auth);
//       return true;
//     } catch (error) {
//       console.error("Error in logout:", error);
//       throw error;
//     }
//   };

//   // User profile functions
// export const createUserProfile = async (uid, data) => {
//     try {
//       await setDoc(doc(db, "userProfiles", uid), {
//         ...data,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       });
      
//       return { uid, ...data };
//     } catch (error) {
//       console.error("Error creating user profile:", error);
//       throw error;
//     }
//   };
  
//   export const getUserProfile = async (uid) => {
//     try {
//       const docRef = doc(db, "userProfiles", uid);
//       const docSnap = await getDoc(docRef);
      
//       if (docSnap.exists()) {
//         return { uid, ...docSnap.data() };
//       } else {
//         return null;
//       }
//     } catch (error) {
//       console.error("Error getting user profile:", error);
//       throw error;
//     }
//   };
  
//   export const updateUserProfile = async (uid, data) => {
//     try {
//       const userRef = doc(db, "userProfiles", uid);
//       await updateDoc(userRef, {
//         ...data,
//         updatedAt: serverTimestamp()
//       });
      
//       return { uid, ...data };
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       throw error;
//     }
//   };
  
//   // Job functions
//   export const createJob = async (jobData) => {
//     try {
//       const jobRef = await addDoc(collection(db, "jobs"), {
//         ...jobData,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       });
      
//       return { id: jobRef.id, ...jobData };
//     } catch (error) {
//       console.error("Error creating job:", error);
//       throw error;
//     }
//   };
  
//   export const getJobs = async () => {
//     try {
//       const jobsCollection = collection(db, "jobs");
//       const jobSnapshot = await getDocs(jobsCollection);
      
//       return jobSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//     } catch (error) {
//       console.error("Error getting jobs:", error);
//       throw error;
//     }
//   };
  
//   export const getJobsByRecruiter = async (recruiterId) => {
//     try {
//       const jobsCollection = collection(db, "jobs");
//       const q = query(jobsCollection, where("recruiterId", "==", recruiterId));
//       const querySnapshot = await getDocs(q);
      
//       return querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//     } catch (error) {
//       console.error("Error getting recruiter jobs:", error);
//       throw error;
//     }
//   };
  
//   export const getJobById = async (jobId) => {
//     try {
//       const docRef = doc(db, "jobs", jobId);
//       const docSnap = await getDoc(docRef);
      
//       if (docSnap.exists()) {
//         return { id: docSnap.id, ...docSnap.data() };
//       } else {
//         return null;
//       }
//     } catch (error) {
//       console.error("Error getting job by ID:", error);
//       throw error;
//     }
//   };
  
//   export const updateJob = async (jobId, jobData) => {
//     try {
//       const jobRef = doc(db, "jobs", jobId);
//       await updateDoc(jobRef, {
//         ...jobData,
//         updatedAt: serverTimestamp()
//       });
      
//       return { id: jobId, ...jobData };
//     } catch (error) {
//       console.error("Error updating job:", error);
//       throw error;
//     }
//   };
  
//   export const deleteJob = async (jobId) => {
//     try {
//       await deleteDoc(doc(db, "jobs", jobId));
//       return true;
//     } catch (error) {
//       console.error("Error deleting job:", error);
//       throw error;
//     }
//   };
  
//   // Job application functions
//   export const applyToJob = async (userId, jobId, applicationData) => {
//     try {
//       const applicationRef = await addDoc(collection(db, "applications"), {
//         userId,
//         jobId,
//         ...applicationData,
//         status: 'pending',
//         appliedAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       });
      
//       return { id: applicationRef.id, userId, jobId, ...applicationData };
//     } catch (error) {
//       console.error("Error applying to job:", error);
//       throw error;
//     }
//   };
  
//   export const getUserApplications = async (userId) => {
//     try {
//       const applicationsCollection = collection(db, "applications");
//       const q = query(applicationsCollection, where("userId", "==", userId));
//       const querySnapshot = await getDocs(q);
      
//       const applications = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       // Get the job details for each application
//       const applicationsWithJobs = await Promise.all(applications.map(async (application) => {
//         const job = await getJobById(application.jobId);
//         return { ...application, job };
//       }));
      
//       return applicationsWithJobs;
//     } catch (error) {
//       console.error("Error getting user applications:", error);
//       throw error;
//     }
//   };
  
//   export const getJobApplications = async (jobId) => {
//     try {
//       const applicationsCollection = collection(db, "applications");
//       const q = query(applicationsCollection, where("jobId", "==", jobId));
//       const querySnapshot = await getDocs(q);
      
//       return querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//     } catch (error) {
//       console.error("Error getting job applications:", error);
//       throw error;
//     }
//   };
  
//   export const updateApplicationStatus = async (applicationId, status) => {
//     try {
//       const applicationRef = doc(db, "applications", applicationId);
//       await updateDoc(applicationRef, {
//         status,
//         updatedAt: serverTimestamp()
//       });
      
//       return { id: applicationId, status };
//     } catch (error) {
//       console.error("Error updating application status:", error);
//       throw error;
//     }
//   };
  
//   // Saved jobs functions
//   export const saveJob = async (userId, jobId) => {
//     try {
//       const savedJobsCollection = collection(db, "savedJobs");
      
//       // Check if already saved
//       const q = query(
//         savedJobsCollection, 
//         where("userId", "==", userId),
//         where("jobId", "==", jobId)
//       );
//       const querySnapshot = await getDocs(q);
      
//       if (querySnapshot.empty) {
//         const savedJobRef = await addDoc(savedJobsCollection, {
//           userId,
//           jobId,
//           savedAt: serverTimestamp()
//         });
        
//         return { id: savedJobRef.id, userId, jobId };
//       } else {
//         return { id: querySnapshot.docs[0].id, userId, jobId };
//       }
//     } catch (error) {
//       console.error("Error saving job:", error);
//       throw error;
//     }
//   };
  
//   export const unsaveJob = async (userId, jobId) => {
//     try {
//       const savedJobsCollection = collection(db, "savedJobs");
//       const q = query(
//         savedJobsCollection, 
//         where("userId", "==", userId),
//         where("jobId", "==", jobId)
//       );
//       const querySnapshot = await getDocs(q);
      
//       if (!querySnapshot.empty) {
//         await deleteDoc(doc(db, "savedJobs", querySnapshot.docs[0].id));
//       }
      
//       return true;
//     } catch (error) {
//       console.error("Error unsaving job:", error);
//       throw error;
//     }
//   };
  
//   export const getSavedJobs = async (userId) => {
//     try {
//       const savedJobsCollection = collection(db, "savedJobs");
//       const q = query(savedJobsCollection, where("userId", "==", userId));
//       const querySnapshot = await getDocs(q);
      
//       const savedJobs = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       // Get the job details for each saved job
//       const savedJobsWithDetails = await Promise.all(savedJobs.map(async (savedJob) => {
//         const job = await getJobById(savedJob.jobId);
//         return { ...savedJob, job };
//       }));
      
//       return savedJobsWithDetails;
//     } catch (error) {
//       console.error("Error getting saved jobs:", error);
//       throw error;
//     }
//   };
  
//   export const isJobSaved = async (userId, jobId) => {
//     try {
//       const savedJobsCollection = collection(db, "savedJobs");
//       const q = query(
//         savedJobsCollection, 
//         where("userId", "==", userId),
//         where("jobId", "==", jobId)
//       );
//       const querySnapshot = await getDocs(q);
      
//       return !querySnapshot.empty;
//     } catch (error) {
//       console.error("Error checking if job is saved:", error);
//       throw error;
//     }
//   };

//   // Add this function to handle role-based registration
// export const registerWithEmailAndPasswordWithRole = async (name, email, password, role) => {
//   try {
//     // Create user with email/password
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;
    
//     // Update profile with display name
//     await updateProfile(user, {
//       displayName: name
//     });
    
//     // Create user profile with role in Firestore
//     await setDoc(doc(db, "users", user.uid), {
//       uid: user.uid,
//       name,
//       email,
//       role,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp()
//     });
    
//     return user;
//   } catch (error) {
//     console.error("Error in registration:", error);
//     throw error;
//   }
// };

// // Add this function to get user role
// export const getUserRole = async (uid) => {
//   try {
//     const docRef = doc(db, "users", uid);
//     const docSnap = await getDoc(docRef);
    
//     if (docSnap.exists()) {
//       return docSnap.data().role;
//     }
//     return null;
//   } catch (error) {
//     console.error("Error getting user role:", error);
//     throw error;
//   }
// };
  
//   export { auth, db };

//   // Add these imports at the top of your firebase.js file
//   import { 
//     getStorage, 
//     ref, 
//     uploadBytesResumable, 
//     getDownloadURL as getStorageDownloadURL 
//   } from "firebase/storage";
  
//   // Initialize Firebase Storage
//   const storage = getStorage(app);
  
//   // Function to upload resume file
//   export const uploadResume = async (userId, file, onProgress) => {
//     return new Promise((resolve, reject) => {
//       try {
//         // Create file reference with user ID and timestamp to ensure uniqueness
//         const timestamp = new Date().getTime();
//         const fileExtension = file.name.split('.').pop();
//         const fileName = `resumes/${userId}/${timestamp}.${fileExtension}`;
//         const storageRef = ref(storage, fileName);
        
//         // Start upload task
//         const uploadTask = uploadBytesResumable(storageRef, file);
        
//         // Monitor upload progress
//         uploadTask.on(
//           'state_changed',
//           (snapshot) => {
//             // Calculate and report progress
//             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//             if (onProgress) onProgress(progress);
//           },
//           (error) => {
//             // Handle upload errors
//             console.error('Upload error:', error);
//             reject(error);
//           },
//           async () => {
//             // Upload completed successfully, get download URL
//             const downloadURL = await getStorageDownloadURL(uploadTask.snapshot.ref);
//             resolve(downloadURL);
//           }
//         );
//       } catch (error) {
//         console.error('Error starting upload:', error);
//         reject(error);
//       }
//     });
//   };
  
//   // Get download URL for an existing file
//   export const getDownloadURL = async (path) => {
//     try {
//       const fileRef = ref(storage, path);
//       return await getStorageDownloadURL(fileRef);
//     } catch (error) {
//       console.error('Error getting download URL:', error);
//       throw error;
//     }
//   };
  
//   // Updated user profile function to ensure proper saving
//   export const updateUserProfileSaving = async (uid, data) => {
//     try {
//       const userRef = doc(db, "userProfiles", uid);
      
//       // Check if document exists first
//       const docSnap = await getDoc(userRef);
      
//       if (docSnap.exists()) {
//         // Update existing document
//         await updateDoc(userRef, {
//           ...data,
//           updatedAt: serverTimestamp()
//         });
//       } else {
//         // Create new document if it doesn't exist
//         await setDoc(userRef, {
//           ...data,
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         });
//       }
      
//       return { uid, ...data };
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       throw error;
//     }
//   };
  
//   // Add these to your existing exports
//   export { storage }
  


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
  increment
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
  storageBucket: "employnext-8bbd8.firebasestorage.app",
  messagingSenderId: "407213440123",
  appId: "1:407213440123:web:e876314164acedaefb36de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

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
    const jobRef = await addDoc(collection(db, "jobs"), {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: jobRef.id, ...jobData };
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const getJobs = async () => {
  try {
    const jobSnapshot = await getDocs(collection(db, "jobs"));
    return jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting jobs:", error);
    throw error;
  }
};

export const getJobsByRecruiter = async (recruiterId) => {
  try {
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

export const getUserApplications = async (userId) => {
  try {
    const q = query(collection(db, "applications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
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
    const q = query(collection(db, "applications"), where("jobId", "==", jobId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting job applications:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const applicationRef = doc(db, "applications", applicationId);
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
    const q = query(
      collection(db, "savedJobs"), 
      where("userId", "==", userId),
      where("jobId", "==", jobId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      const savedJobRef = await addDoc(collection(db, "savedJobs"), {
        userId,
        jobId,
        savedAt: serverTimestamp()
      });
      return { id: savedJobRef.id, userId, jobId };
    }
    return { id: querySnapshot.docs[0].id, userId, jobId };
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

export const unsaveJob = async (userId, jobId) => {
  try {
    const q = query(
      collection(db, "savedJobs"),
      where("userId", "==", userId),
      where("jobId", "==", jobId)
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
    const q = query(collection(db, "savedJobs"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const savedJobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
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
    const q = query(
      collection(db, "savedJobs"),
      where("userId", "==", userId),
      where("jobId", "==", jobId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if job is saved:", error);
    throw error;
  }
};

// Role Management
export const registerWithEmailAndPasswordWithRole = async (name, email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    
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
    const fileRef = ref(storage, path);
    return await getStorageDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

// Export core services
export { auth, db, storage };


export const cancelApplication = async (applicationId) => {
  try {
    await deleteDoc(doc(db, "applications", applicationId));
    return true;
  } catch (error) {
    console.error("Error cancelling application:", error);
    throw error;
  }
};