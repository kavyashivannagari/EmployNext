import { useState, useEffect } from 'react';
import { auth, getUserProfile, updateUserProfileSaving } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

const RecruiterProfileModal = ({ isOpen, onClose, onProfileUpdate }) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  
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
          return;
        }

        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          setFullName(profile.fullName || '');
          setPosition(profile.position || '');
          setLocation(profile.location || '');
          setCompanyName(profile.companyName || '');
          setIndustry(profile.industry || '');
          setCompanyWebsite(profile.companyWebsite || '');
          setCompanyDescription(profile.companyDescription || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

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

      // Create the profile data object
      const profileData = {
        fullName,
        position,
        location,
        companyName,
        industry,
        companyWebsite,
        companyDescription
      };

      // Save the profile using the updateUserProfileSaving function
      await updateUserProfileSaving(user.uid, profileData);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Notify parent component that profile was updated
        if (onProfileUpdate) {
          onProfileUpdate(profileData);
        }
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Company Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recruiter Information</h3>
                
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
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g., HR Manager"
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
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Company Information</h3>
                
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input 
                    id="companyWebsite"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea 
                    id="companyDescription"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Tell candidates about your company"
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfileModal;