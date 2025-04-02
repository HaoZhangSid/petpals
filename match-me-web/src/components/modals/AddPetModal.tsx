import React, { useState, useRef, useEffect } from 'react';
import { Pet } from '../../types';
import { api } from '../../services/api';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPetAdded: (pet: Pet) => void;
}

const AddPetModal: React.FC<AddPetModalProps> = ({ isOpen, onClose, onPetAdded }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const totalSteps = 5;

  // Pet form data
  const [petData, setPetData] = useState<Partial<Pet>>({
    name: '',
    type: 'Dog',
    breed: '',
    age: 0,
    gender: '',
    description: '',
    weight: 0,
    birthday: '',
    isMicrochipped: false,
    isVaccinated: false,
    isNeutered: false,
    personality: [],
    favoriteActivities: [],
    avatar: '',
    photos: []
  });

  // Photo handling
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For form validation
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Handle clicking outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPetData({
        name: '',
        type: 'Dog',
        breed: '',
        age: 0,
        gender: '',
        description: '',
        weight: 0,
        birthday: '',
        isMicrochipped: false,
        isVaccinated: false,
        isNeutered: false,
        personality: [],
        favoriteActivities: [],
        avatar: '',
        photos: []
      });
      setAvatarPreview('');
      setPhotosPreviews([]);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle file selection for avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, here we would upload to a server/cloud storage
      // For now, we'll just create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setPetData({ ...petData, avatar: result }); // In real app, this would be the URL from server
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file selection for additional photos
  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews: string[] = [];
      const newPhotos: string[] = [];
      
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newPreviews.push(result);
          newPhotos.push(result); // In real app, these would be URLs from server
          
          if (newPreviews.length === files.length) {
            setPhotosPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
            setPetData({ 
              ...petData, 
              photos: [...(petData.photos || []), ...newPhotos] 
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPetData({ ...petData, [name]: checked });
    } else {
      setPetData({ ...petData, [name]: value });
    }
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle personality trait selection
  const handlePersonalityChange = (trait: string) => {
    const currentTraits = petData.personality || [];
    
    if (currentTraits.includes(trait)) {
      setPetData({
        ...petData,
        personality: currentTraits.filter(t => t !== trait)
      });
    } else {
      setPetData({
        ...petData,
        personality: [...currentTraits, trait]
      });
    }
  };

  // Handle favorite activity selection
  const handleActivityChange = (activity: string) => {
    const currentActivities = petData.favoriteActivities || [];
    
    if (currentActivities.includes(activity)) {
      setPetData({
        ...petData,
        favoriteActivities: currentActivities.filter(a => a !== activity)
      });
    } else {
      setPetData({
        ...petData,
        favoriteActivities: [...currentActivities, activity]
      });
    }
  };

  // Validate each step before proceeding
  const validateStep = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    switch (step) {
      case 1: // Basic Info
        if (!petData.name?.trim()) newErrors.name = 'Pet name is required';
        if (!petData.breed?.trim()) newErrors.breed = 'Breed is required';
        if (!petData.age || petData.age <= 0) newErrors.age = 'Valid age is required';
        if (!petData.gender?.trim()) newErrors.gender = 'Gender is required';
        break;
      
      case 2: // Photos
        if (!petData.avatar) newErrors.avatar = 'Pet avatar is required';
        break;
      
      // Step 3 (Health info) and Step 4 (Personality) don't have required fields
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step button
  const handleNext = () => {
    if (validateStep()) {
      setStep(current => Math.min(current + 1, totalSteps));
    }
  };

  // Handle previous step button
  const handlePrevious = () => {
    setStep(current => Math.max(current - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would send data to your API
      // const response = await api.post('/pets', petData);
      // const newPet = response.data;
      
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        // Create a mock pet with an ID
        const newPet = {
          ...petData,
          id: `pet-${Date.now()}`,
          userId: 'user-1',
          createdAt: new Date().toISOString()
        } as Pet;
        
        onPetAdded(newPet);
        setLoading(false);
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error adding pet:', error);
      setLoading(false);
      // Handle error (show error message, etc.)
    }
  };

  // Personality trait options
  const personalityTraits = [
    'Friendly', 'Energetic', 'Calm', 'Shy', 'Independent', 
    'Playful', 'Curious', 'Gentle', 'Affectionate', 'Protective',
    'Social', 'Smart', 'Stubborn', 'Loyal', 'Vocal'
  ];

  // Favorite activity options
  const activityOptions = [
    'Walks', 'Dog Park', 'Hiking', 'Beach Outings', 'Fetch',
    'Agility Training', 'Swimming', 'Cuddles', 'Toys', 'Car Rides',
    'Sunbathing', 'Bird Watching', 'Climbing', 'Scratching Posts'
  ];

  // Render form based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-700">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name*</label>
              <input
                type="text"
                name="name"
                value={petData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                placeholder="Max, Luna, Charlie..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type*</label>
              <select
                name="type"
                value={petData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Fish">Fish</option>
                <option value="Small Animal">Small Animal</option>
                <option value="Reptile">Reptile</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed*</label>
              <input
                type="text"
                name="breed"
                value={petData.breed}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.breed ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                placeholder="Golden Retriever, Siamese Cat..."
              />
              {errors.breed && <p className="mt-1 text-sm text-red-500">{errors.breed}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)*</label>
                <input
                  type="number"
                  name="age"
                  value={petData.age || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className={`w-full px-3 py-2 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="2.5"
                />
                {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                <select
                  name="gender"
                  value={petData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={petData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="Tell us about your pet..."
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-purple-700">Pet Photos</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture*</label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden bg-gray-50">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700 transition"
                  >
                    Select Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                  {errors.avatar && <p className="mt-1 text-sm text-red-500">{errors.avatar}</p>}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Photos (Optional)</label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {photosPreviews.map((preview, index) => (
                  <div key={index} className="w-full aspect-square rounded-md overflow-hidden border border-gray-200">
                    <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => document.getElementById('photos-upload')?.click()}
                  className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-xs mt-2">Add Photo</span>
                </button>
                <input
                  id="photos-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotosChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500">Upload up to 5 photos of your pet.</p>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-purple-700">Health Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  name="weight"
                  value={petData.weight || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="25.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={petData.birthday}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMicrochipped"
                  name="isMicrochipped"
                  checked={petData.isMicrochipped}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="isMicrochipped" className="ml-2 block text-sm text-gray-700">
                  Microchipped
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVaccinated"
                  name="isVaccinated"
                  checked={petData.isVaccinated}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="isVaccinated" className="ml-2 block text-sm text-gray-700">
                  Vaccinations up to date
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNeutered"
                  name="isNeutered"
                  checked={petData.isNeutered}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="isNeutered" className="ml-2 block text-sm text-gray-700">
                  Spayed/Neutered
                </label>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-purple-700">Personality & Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {personalityTraits.map(trait => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => handlePersonalityChange(trait)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      petData.personality?.includes(trait)
                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">Select traits that best describe your pet's personality.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Activities</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {activityOptions
                  .filter(activity => {
                    // Filter activities based on pet type
                    if (petData.type === 'Dog') return !['Scratching Posts', 'Bird Watching', 'Climbing'].includes(activity);
                    if (petData.type === 'Cat') return !['Dog Park', 'Agility Training', 'Car Rides'].includes(activity);
                    if (petData.type === 'Bird') return ['Toys', 'Climbing', 'Sunbathing'].includes(activity);
                    return true;
                  })
                  .map(activity => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => handleActivityChange(activity)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        petData.favoriteActivities?.includes(activity)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {activity}
                    </button>
                  ))
                }
              </div>
              <p className="text-xs text-gray-500">Select activities that your pet enjoys.</p>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-purple-700">Review & Confirm</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                {avatarPreview && (
                  <img src={avatarPreview} alt="Pet Preview" className="w-16 h-16 rounded-full object-cover mr-4" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{petData.name}</h4>
                  <p className="text-sm text-gray-600">
                    {petData.breed} • {petData.age} year{Number(petData.age) !== 1 ? 's' : ''} old • {petData.gender}
                  </p>
                  {petData.description && (
                    <p className="text-sm text-gray-600 mt-2">{petData.description}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 border-t border-gray-200 pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Weight:</span>{' '}
                  <span className="font-medium">{petData.weight ? `${petData.weight} lbs` : 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Birthday:</span>{' '}
                  <span className="font-medium">{petData.birthday || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Microchipped:</span>{' '}
                  <span className="font-medium">{petData.isMicrochipped ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Vaccinated:</span>{' '}
                  <span className="font-medium">{petData.isVaccinated ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Spayed/Neutered:</span>{' '}
                  <span className="font-medium">{petData.isNeutered ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              {(petData.personality && petData.personality.length > 0) && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Personality</h5>
                  <div className="flex flex-wrap gap-2">
                    {petData.personality.map(trait => (
                      <span key={trait} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(petData.favoriteActivities && petData.favoriteActivities.length > 0) && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Favorite Activities</h5>
                  <div className="flex flex-wrap gap-2">
                    {petData.favoriteActivities.map(activity => (
                      <span key={activity} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Photos</h5>
                <div className="grid grid-cols-5 gap-2">
                  {avatarPreview && (
                    <div className="relative">
                      <img src={avatarPreview} alt="Avatar" className="w-full aspect-square rounded-md object-cover" />
                      <span className="absolute top-0 right-0 bg-pink-500 text-white text-xs px-1 rounded-bl-md">Avatar</span>
                    </div>
                  )}
                  {photosPreviews.map((preview, index) => (
                    <img key={index} src={preview} alt={`Photo ${index + 1}`} className="w-full aspect-square rounded-md object-cover" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Please review all the information above before submitting. Once your pet profile is created, you'll be able to edit it later from your profile page.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-purple-700">Add a New Pet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > index + 1 ? 'bg-green-500 text-white' : 
                    step === index + 1 ? 'bg-pink-500 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > index + 1 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>Basic Info</span>
            <span>Photos</span>
            <span>Health</span>
            <span>Personality</span>
            <span>Review</span>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-6">
          {renderStepContent()}
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white z-10 flex justify-between">
          {step > 1 ? (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Back
            </button>
          ) : (
            <div></div> // Empty div to maintain layout with flex justify-between
          )}
          
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Pet Profile'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPetModal; 