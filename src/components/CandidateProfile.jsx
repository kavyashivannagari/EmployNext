
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getUserProfile, updateUserProfileSaving, uploadResume } from '../lib/firebase';
import Header from './Header';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadCloud } from 'lucide-react';

const CandidateProfile = () => {
  const navigate = useNavigate();
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  
  // Resume upload
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          setFullName(profile.fullName || '');
          setTitle(profile.title || '');
          setLocation(profile.location || '');
          setSkills(profile.skills || '');
          setEducation(profile.education || '');
          setBio(profile.bio || '');
          setExperience(profile.experience || '');
          setResumeName(profile.resumeName || '');
          setResumeUrl(profile.resumeUrl || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const validateAndSetFile = (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    
    const isTypeValid = validTypes.includes(file.type) || 
      validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isTypeValid) {
      setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      return false;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Maximum size is 5MB.');
      return false;
    }
    
    setResumeFile(file);
    setResumeName(file.name);
    setError(null);
    return true;
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError('Please select a file first');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      const user = auth.currentUser;
      
      if (!user) {
        setError('You must be logged in to upload a resume');
        return;
      }
      
      const url = await uploadResume(user.uid, resumeFile, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      
      setResumeUrl(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError(`Failed to upload resume: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to save your profile");
        return;
      }

      const profileData = {
        fullName,
        title,
        location,
        skills,
        education,
        bio,
        experience,
        resumeName: resumeName || '',
        resumeUrl: resumeUrl || ''
      };

      await updateUserProfileSaving(user.uid, profileData);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
    navigate("/candidate-dashboard");
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
      <Header user={auth.currentUser} userRole="candidate" />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-600">
              <AlertDescription className="text-green-800 dark:text-green-300">
                Your profile has been saved successfully!
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Front-end Developer"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State/Province, Country"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input 
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>
                
                <div>
                  <Label htmlFor="education">Education Level</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your highest education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highschool">High School</SelectItem>
                      <SelectItem value="associates">Associate's Degree</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD/Doctorate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="experience">Professional Experience</Label>
                  <Textarea 
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Briefly describe your work history and relevant experience"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell employers about yourself"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumeUrl ? (
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                      <p className="font-medium text-green-800 dark:text-green-300">Resume Uploaded</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-700 dark:text-green-400">{resumeName}</span>
                        <a 
                          href={resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-4 text-sm text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ) : null}
                  
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className={`mx-auto h-12 w-12 ${
                      isDragActive ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <div className="mt-4">
                      <Label htmlFor="resume" className="cursor-pointer">
                        <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                      </Label>
                      <Input 
                        id="resume"
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleResumeChange}
                      />
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC or DOCX (max. 5MB)</p>
                    </div>
                    
                    {resumeFile && !resumeUrl && (
                      <div className="mt-4">
                        <p className="text-sm">{resumeFile.name}</p>
                        <Button 
                          onClick={handleResumeUpload}
                          disabled={isUploading}
                          type="button"
                          className="mt-2 w-full"
                        >
                          {isUploading ? `Uploading (${uploadProgress}%)` : 'Upload Resume'}
                        </Button>
                        {uploadProgress > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/candidate-dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || isUploading}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CandidateProfile;