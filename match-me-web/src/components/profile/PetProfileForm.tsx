import React, { useState, useEffect, useRef } from 'react';
import { Pet, Photo } from '../../types'; // Assuming Photo type might still be used indirectly
import { motion } from 'motion/react';
import { api } from '../../services/api'; // Import api service
import { toast } from 'react-hot-toast'; // Import toast

interface PetProfileFormProps {
  pet?: Pet;
  mode: 'create' | 'edit';
  // onSubmit is likely no longer needed from outside, but keep type for now due to ModalContext
  onSubmit: (petData: Partial<Pet>) => Promise<void>; 
  onCancel: () => void;
  onSuccess?: (pet: Pet) => void; // Add onSuccess callback prop
}

const PetProfileForm: React.FC<PetProfileFormProps> = ({
  pet,
  mode,
  // onSubmit prop is received but will not be used inside doSubmit
  onSubmit: _onSubmit, // Rename to indicate it's unused
  onCancel,
  onSuccess
}) => {
  // Initialize form data excluding photo-related fields
  const initialData: Partial<Pet> = {
    name: pet?.name || '',
    type: pet?.type || 'Dog',
    breed: pet?.breed ?? null,
    // age: removed
    gender: pet?.gender ?? null,
    weight: pet?.weight ?? null,
    bio: pet?.bio ?? null,
    birthday: pet?.birthday ? new Date(pet.birthday).toISOString().split('T')[0] : null, // Format for date input
    personality: pet?.personality ?? [],
    playStyle: pet?.playStyle ?? [],
    activityLevel: pet?.activityLevel ?? null,
    isMicrochipped: pet?.isMicrochipped ?? false, 
    isVaccinated: pet?.isVaccinated ?? false,
    isNeutered: pet?.isNeutered ?? false,
    favoriteActivities: pet?.favoriteActivities ?? [],
    // avatarUrl and photoUrls are handled separately
  };

  // Form state for non-file fields
  const [formData, setFormData] = useState<Partial<Pet>>(initialData);
  // Remove avatarFile and newPhotoFiles state
  // const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Remove Refs for file inputs
  // const avatarInputRef = useRef<HTMLInputElement>(null);
  // const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [newPersonality, setNewPersonality] = useState('');
  const [newActivity, setNewActivity] = useState('');
  
  // 响应式设计 - 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 确保文件输入引用正确初始化
  useEffect(() => {
    // 调试日志
    console.log("Refs initialized:", {
      // avatarRef: !!avatarInputRef.current,
      // photoRef: !!photoInputRef.current
    });
  }, []);
  
  const isMobile = windowWidth < 768;
  
  // Update steps - remove avatar and gallery steps
  const steps = [
    { title: "Basic Information", fields: ["name", "type", "breed", "gender"] }, // Removed age, avatar
    { title: "Personality & Preferences", fields: ["personality", "activityLevel", "playStyle", "bio"] },
    { title: "Health Information", fields: ["weight", "birthday", "isMicrochipped", "isVaccinated", "isNeutered"] },
    // Removed Gallery step
  ];
  
  // Corrected Input Change Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
        setFormData(prev => ({
          ...prev,
          [name]: value === '' ? null : parseFloat(value) // Set state to null if empty
        }));
    } else if (type === 'date') {
        setFormData(prev => ({
          ...prev,
          [name]: value === '' ? null : value // Set state to null if empty
        }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // 新增性格特点
  const handleAddPersonality = () => {
    if (newPersonality.trim() && !formData.personality?.includes(newPersonality.trim())) {
      setFormData(prev => ({
        ...prev,
        personality: [...(prev.personality || []), newPersonality.trim()]
      }));
      setNewPersonality('');
    }
  };
  
  // 移除性格特点
  const handleRemovePersonality = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality?.filter(item => item !== trait)
    }));
  };
  
  // 新增喜爱活动
  const handleAddActivity = () => {
    if (newActivity.trim() && !formData.favoriteActivities?.includes(newActivity.trim())) {
      setFormData(prev => ({
        ...prev,
        favoriteActivities: [...(prev.favoriteActivities || []), newActivity.trim()]
      }));
      setNewActivity('');
    }
  };
  
  // 移除喜爱活动
  const handleRemoveActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteActivities: prev.favoriteActivities?.filter(item => item !== activity)
    }));
  };
  
  // --- Updated Form Submission Logic --- 
  const doSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const submissionData: Partial<Pet> = {
      name: formData.name,
      type: formData.type,
      breed: formData.breed || undefined, // Send undefined if empty string/null
      gender: formData.gender || undefined,
      weight: formData.weight,
      bio: formData.bio || undefined,
      birthday: formData.birthday ? new Date(formData.birthday).toISOString() : undefined,
      personality: formData.personality?.length ? formData.personality : undefined,
      playStyle: formData.playStyle?.length ? formData.playStyle : undefined,
      activityLevel: formData.activityLevel || undefined,
      favoriteActivities: formData.favoriteActivities?.length ? formData.favoriteActivities : undefined,
      isMicrochipped: formData.isMicrochipped,
      isVaccinated: formData.isVaccinated,
      isNeutered: formData.isNeutered,
    };

    // Remove undefined properties before sending (cleaner payload for PATCH/PUT)
    Object.keys(submissionData).forEach(key => {
        if (submissionData[key as keyof typeof submissionData] === undefined) {
            delete submissionData[key as keyof typeof submissionData];
        }
    });

    console.log(`Submitting Pet Data (mode: ${mode}):`, submissionData);

    try {
      let responsePet: Pet;
      if (mode === 'create') {
        const response = await api.post<Pet>('/api/v1/me/pets', submissionData);
        responsePet = response.data;
        toast.success('Pet added successfully!');
        // Note: ModalContext.handleAddPet used to call addPetToStore.
        // We might need an onSuccess callback here to update the store.
        // For now, we rely on closing the modal and potentially a parent component re-fetching.
      } else if (mode === 'edit' && pet?.id) {
        const response = await api.put<Pet>(`/api/v1/me/pets/${pet.id}`, submissionData);
        responsePet = response.data;
        toast.success('Pet profile updated successfully!');
        // Similar to create, may need onSuccess callback to update store.
      } else {
        throw new Error("Invalid mode or missing pet ID for edit.");
      }
      console.log("API Response Pet:", responsePet); // Log the response from API
      
      // Call onSuccess callback if provided, before closing the modal
      onSuccess?.(responsePet);
      
      onCancel(); // Close modal on success

    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || 'An error occurred';
      console.error("Submission failed:", error.response || error);
      toast.error(`Failed: ${errMsg}`);
      // Keep modal open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step navigation
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      doSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    } else {
      onCancel();
    }
  };
  
  const handleStepClick = (stepIndex: number) => {
    if (mode === 'edit' || (currentStep === 1 && formData.name && formData.type)) {
        setCurrentStep(stepIndex + 1);
        window.scrollTo(0, 0);
    } else if (currentStep === 1 && (!formData.name || !formData.type)) {
        alert('Please fill in Pet Name and Type before proceeding.');
    }
    else if (stepIndex < currentStep -1) {
         setCurrentStep(stepIndex + 1);
         window.scrollTo(0, 0);
    }
  };

  // Render functions for each step
  const renderBasicInfoStep = () => {
    // Remove avatar preview and input
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        {/* Avatar preview and input removed */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
          <input id="name" name="name" value={formData.name ?? ''} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Pet Type *</label>
          <select 
            id="type" 
            name="type" 
            value={formData.type ?? 'Dog'} 
            onChange={handleInputChange} 
            required 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
          <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <input 
            id="breed" 
            name="breed" 
            value={formData.breed ?? ''} 
            onChange={handleInputChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select 
              id="gender" 
              name="gender" 
              value={formData.gender ?? ''} 
              onChange={handleInputChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // 渲染表单步骤2: 性格和喜好
  const renderPersonalityStep = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">About Your Pet</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio ?? ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Tell others about your pet..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.personality && formData.personality.map((trait, index) => (
            <div key={index} className="bg-lavender bg-opacity-30 text-purple-700 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{trait}</span>
              <button 
                type="button"
                onClick={() => handleRemovePersonality(trait)}
                className="ml-2 text-opacity-70 hover:text-opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={newPersonality}
            onChange={(e) => setNewPersonality(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="E.g., Friendly, Playful, Calm..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddPersonality()}
          />
          <button
            type="button"
            onClick={handleAddPersonality}
            className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add a trait</p>
      </div>
      
      <div>
        <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
        <select
          id="activityLevel"
          name="activityLevel"
          value={formData.activityLevel ?? ''}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select activity level</option>
          <option value="Low Energy">Low Energy</option>
          <option value="Moderate Energy">Moderate Energy</option>
          <option value="High Energy">High Energy</option>
          <option value="Very Active">Very Active</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Activities</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.favoriteActivities && formData.favoriteActivities.map((activity, index) => (
            <div key={index} className="bg-mintgreen bg-opacity-30 text-green-700 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{activity}</span>
              <button 
                type="button"
                onClick={() => handleRemoveActivity(activity)}
                className="ml-2 text-opacity-70 hover:text-opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="E.g., Fetch, Swimming, Hiking..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
          />
          <button
            type="button"
            onClick={handleAddActivity}
            className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">What activities does your pet enjoy?</p>
      </div>
    </motion.div>
  );
  
  // 渲染表单步骤3: 健康信息
  const renderHealthInfoStep = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={String(formData.weight ?? '')}
            onChange={handleInputChange}
            min="0"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., 15.5"
          />
        </div>
        
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday && typeof formData.birthday === 'string' ? formData.birthday.slice(0, 10) : ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isMicrochipped"
            name="isMicrochipped"
            checked={!!formData.isMicrochipped}
            onChange={handleInputChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
            checked={!!formData.isVaccinated}
            onChange={handleInputChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
            checked={!!formData.isNeutered}
            onChange={handleInputChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="isNeutered" className="ml-2 block text-sm text-gray-700">
            Neutered/Spayed
          </label>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg mt-6">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Health Information Privacy</h4>
        <p className="text-xs text-yellow-700">
          Health information helps other pet parents know if their pets are compatible with yours.
          We only display this information as badges on your pet's profile.
        </p>
      </div>
    </motion.div>
  );
  
  // 根据当前步骤渲染相应表单部分
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderPersonalityStep();
      case 3:
        return renderHealthInfoStep();
      // case 4 removed
      default:
        return null;
    }
  };

  // Effect to revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    // Store the generated URLs to revoke them later
    const urlsToRevoke: string[] = [];
    // newPhotoFiles.forEach(file => {
    //   // If we were storing the URL on the file object:
    //   // if (file.previewUrl) urlsToRevoke.push(file.previewUrl);
    //   // Since we generate in map, we don't have a stable list here.
    //   // A better approach might be to store the URL with the file state.
    //   // For now, we'll rely on removing them via handleRemoveNewPhoto and maybe a less precise cleanup.
    // });

    // Return cleanup function
    return () => {
      // This cleanup runs when the component unmounts OR newPhotoFiles changes
      // Revoking here might be too broad if files persist across steps/renders.
      // console.log("Cleaning up object URLs...", urlsToRevoke);
      // urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
      // Let's postpone the robust cleanup implementation for now.
      // The browser should handle it upon page navigation, but it's not ideal.
      console.log("PetProfileForm unmounting or dependencies changing - Object URL cleanup needed but deferred.");
    };
  }, []); // Re-run only on mount/unmount for now

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <motion.div 
        className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-purple-700">
              {mode === 'create' ? 'Add New Pet' : `Edit ${pet?.name}'s Profile`}
            </h2>
            <p className="text-xs text-gray-500">
              {isMobile 
                ? `Step ${currentStep} of ${steps.length}` 
                : `Complete all ${steps.length} sections to ${mode === 'create' ? 'create' : 'update'} your pet's profile`
              }
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress Bar - Desktop Only */}
        {!isMobile && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div 
                    className="flex items-center cursor-pointer group" 
                    onClick={() => handleStepClick(index)}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        currentStep > index + 1 
                          ? 'bg-green-500 text-white' 
                          : currentStep === index + 1 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                      }`}
                    >
                      {currentStep > index + 1 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`ml-2 text-sm transition-colors duration-200 ${
                      currentStep === index + 1 
                        ? 'font-medium text-gray-700' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        
        {/* 移动版步骤指示器 */}
        {isMobile && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleStepClick(index)}
                >
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      currentStep > index + 1 
                        ? 'bg-green-500 text-white' 
                        : currentStep === index + 1 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-xs ${currentStep === index + 1 ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
                    {step.title.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Form Content */}
        <form onSubmit={(e) => { e.preventDefault(); doSubmit(); }} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6">
            {renderCurrentStep()}
          </div>
        </form>
        
        {/* Action Buttons */}
        <div className="border-t border-gray-100 p-4 sm:p-6 bg-white flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-5 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="px-5 py-2 bg-softpink hover:bg-pink-500 text-white rounded-full transition"
            disabled={isSubmitting}
          >
            {currentStep < steps.length 
              ? 'Next' 
              : (isSubmitting ? 'Saving...' : `${mode === 'create' ? 'Create Pet' : 'Save Changes'}`)}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PetProfileForm; 