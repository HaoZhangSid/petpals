import React, { useState, useEffect, useRef } from 'react';
import { Pet } from '../../types';
import { motion } from 'framer-motion';

interface PetProfileFormProps {
  pet?: Pet; // 如果是编辑模式则提供现有宠物数据，创建模式则为undefined
  mode: 'create' | 'edit';
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const PetProfileForm: React.FC<PetProfileFormProps> = ({
  pet,
  mode,
  onSubmit,
  onCancel
}) => {
  // Corrected initialData initialization
  const initialData: Partial<Pet> = {
    name: pet?.name || '',
    type: pet?.type || 'Dog',
    breed: pet?.breed ?? null,
    age: pet?.age ?? null,
    gender: pet?.gender ?? null,
    weight: pet?.weight ?? null,
    bio: pet?.bio ?? null,
    birthday: pet?.birthday ?? null,
    personality: pet?.personality ?? [],
    playStyle: pet?.playStyle ?? [],
    activityLevel: pet?.activityLevel ?? null,
    isMicrochipped: pet?.isMicrochipped ?? false, // Default non-null boolean to false
    isVaccinated: pet?.isVaccinated ?? false,
    isNeutered: pet?.isNeutered ?? false,
    favoriteActivities: pet?.favoriteActivities ?? [],
    avatar: pet?.avatar ?? null,
    photos: pet?.photos ?? []
  };

  // 表单状态
  const [formData, setFormData] = useState<Partial<Pet>>(initialData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // State for the actual avatar File object
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  // 新增的性格特点和活动的临时状态
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
      avatarRef: !!avatarInputRef.current,
      photoRef: !!photoInputRef.current
    });
  }, []);
  
  const isMobile = windowWidth < 768;
  
  // 表单步骤数据
  const steps = [
    { title: "Basic Information", fields: ["name", "type", "breed", "age", "gender", "avatar"] },
    { title: "Personality & Preferences", fields: ["personality", "activityLevel", "playStyle", "bio"] },
    { title: "Health Information", fields: ["weight", "birthday", "isMicrochipped", "isVaccinated", "isNeutered"] },
    { title: "Gallery", fields: ["photos"] }
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
  
  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { alert('图片大小不能超过 5MB'); return; }
      if (!file.type.match('image.*')) { alert('请选择图片文件'); return; }

      setAvatarFile(file); // Store the File object

      const reader = new FileReader();
      reader.onload = (event) => {
        const target = event.target; // Assign to variable first
        if (target && target.result) { // Check if target and result exist
          setFormData(prev => ({ ...prev, avatar: target.result as string })); // Update preview
        }
      };
      reader.onerror = () => { setAvatarFile(null); alert('图片读取失败，请重试'); };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      // Optionally reset preview
      // setFormData(prev => ({ ...prev, avatar: initialData.avatar })); 
    }
  };
  
  // 显式处理头像点击
  const handleAvatarClick = () => {
    console.log("Avatar click triggered");
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    } else {
      console.error("Avatar input reference is null");
    }
  };
  
  // 处理照片上传
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Photo file selection triggered");
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      let addedFiles: File[] = [];
      let skippedFiles: string[] = [];

      // 限制上传数量 (Consider existing + new photos)
      // Let's limit based on NEW files for now, backend might have total limit
      // if (formData.photos && formData.photos.length + files.length > 10) {
      //   alert('最多只能上传10张照片 (包括已有的)');
      //   return;
      // }
      if (files.length > 10) {
         alert(`一次最多只能选择 10 张新照片`);
         return;
      }


      files.forEach(file => {
        // 检查文件大小 (限制为 5MB)
        if (file.size > 5 * 1024 * 1024) {
          skippedFiles.push(`${file.name} (大小超过 5MB)`);
          return;
        }

        // 检查文件类型
        if (!file.type.match('image.*')) {
          skippedFiles.push(`${file.name} (非图片格式)`);
          return;
        }

        // Add valid file to the list to be added to state
        addedFiles.push(file);

        // Optional: Add Base64 preview to formData.photos for immediate display
        // const reader = new FileReader();
        // reader.onload = (event) => {
        //   const target = event.target;
        //   if (target && target.result) {
        //     setFormData(prev => ({
        //       ...prev,
        //       photos: [...(prev.photos || []), target.result as string]
        //     }));
        //   }
        // };
        // reader.readAsDataURL(file); // Read for preview
      });

      // Update the state with the newly selected files
      setNewPhotoFiles(prev => [...prev, ...addedFiles]);

      if (skippedFiles.length > 0) {
        alert(`以下文件未添加:\n${skippedFiles.join('\n')}`);
      }

       // Clear the file input value to allow selecting the same file again if needed
       if (e.target) {
         e.target.value = '';
       }

      console.log(`Added ${addedFiles.length} new photo files. Total new: ${newPhotoFiles.length + addedFiles.length}`);
    }
  };
  
  // 显式处理照片点击
  const handlePhotoClick = () => {
    console.log("Photo add button clicked");
    if (photoInputRef.current) {
      photoInputRef.current.click();
    } else {
      console.error("Photo input reference is null");
    }
  };
  
  // 移除照片
  const handleRemovePhoto = (index: number) => {
    // TODO: Decide how to handle removing NEWLY added files vs existing ones
    // If previews are added to formData.photos, this might work for new ones too,
    // but we also need to remove from newPhotoFiles state if it's a new one.
    // For now, this only removes existing photos shown via formData.photos
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
    console.warn("handleRemovePhoto currently only removes from displayed list (formData.photos), not necessarily from new files to be uploaded.");
    // Potential future logic: Check if the index corresponds to a file in newPhotoFiles
    // and remove it from there as well. Requires mapping index to file.
  };
  
  // Add handler to remove a file from the newPhotoFiles state
  const handleRemoveNewPhoto = (indexToRemove: number) => {
    // Optional: Revoke object URL if previews are generated this way
    // const fileToRemove = newPhotoFiles[indexToRemove];
    // if (fileToRemove.previewUrl) { // Assuming we add a previewUrl property
    //   URL.revokeObjectURL(fileToRemove.previewUrl);
    // }
    setNewPhotoFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    console.log(`Removed new photo file at index: ${indexToRemove}`);
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
  
  // Form submission logic
  const doSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Create FormData
    const submissionData = new FormData();

    // Append non-file fields from formData
    Object.entries(formData).forEach(([key, value]) => {
      // We only skip avatar now, as photos might contain the list of remaining URLs
      if (key !== 'avatar' && value !== null && value !== undefined) {
        // Handle arrays (personality, favoriteActivities, playStyle, photos)
        if (Array.isArray(value)) {
          // Special handling for the 'photos' array (list of remaining URLs)
          if (key === 'photos') {
            // Send each URL with the key 'photos'
            value.forEach((url: string) => {
              submissionData.append('photos', url);
            });
          } else {
            // Handle other arrays (e.g., personality) - Still needs backend parsing adjustment
            // For now, join with comma? Or send multiple?
            // Let's stick to comma-separated for now for simplicity, assuming backend parses.
            submissionData.append(key, value.join(','));
            console.warn(`Array field '${key}' sent as comma-separated string. Ensure backend parser handles this.`);
            // submissionData.append(key, JSON.stringify(value)); // Option B: JSON string
            // value.forEach(item => submissionData.append(`${key}[]`, item)); // Option C: Standard array format
          }
        } else if (typeof value === 'boolean') {
           submissionData.append(key, value.toString());
        } else {
          submissionData.append(key, String(value)); // Convert numbers etc. to string
        }
      }
    });

    // Explicitly signal if the photos array should be empty
    // Check if the original photos array in formData was empty 
    if (Array.isArray(formData.photos) && formData.photos.length === 0) {
        // Only append the empty marker if the key wasn't already added (e.g., by the loop if it somehow did)
        if (!submissionData.has('photos')) {
             submissionData.append('photos', ''); // Add empty string as signal for empty list
             console.log("Appending 'photos=\'\' to signal empty list.");
        }
    }

    // Append avatar file if selected
    if (avatarFile) {
      submissionData.append('petImage', avatarFile, avatarFile.name);
    }

    // Append new photo files if selected
    if (newPhotoFiles.length > 0) {
      newPhotoFiles.forEach((file, index) => {
        // Backend handler expects multiple files under the same key "petPhotos"
        submissionData.append('petPhotos', file, file.name);
      });
    }

    // Debug: Log FormData contents (can't directly log FormData, need to iterate)
    console.log("Submitting FormData:");
    for (let [key, value] of submissionData.entries()) {
      console.log(key, value);
    }


    try {
      // Call the onSubmit prop with the FormData object
      await onSubmit(submissionData);
      // Reset states on success? Depends on parent component logic (e.g., closing modal)
      // setAvatarFile(null);
      // setNewPhotoFiles([]);
    } catch (error) {
      console.error("Submission failed:", error);
      // Keep state for user to retry or fix
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
    // Calculate the correct URL to display for the avatar preview
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    let displayImageUrl = '/placeholder-pet.png'; // Default placeholder
    
    if (formData.avatar) {
      if (formData.avatar.startsWith('/uploads/')) {
        displayImageUrl = `${apiBaseUrl}${formData.avatar}`;
      } else {
        displayImageUrl = formData.avatar; // Assume Data URL or full URL
      }
    } else {
       displayImageUrl = formData.type === 'Dog' ? '/placeholder-dog.png' : '/placeholder-cat.png';
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <img 
              src={displayImageUrl} // Use calculated URL
              alt="Pet Avatar Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto cursor-pointer bg-gray-100"
              onClick={handleAvatarClick}
              onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-pet.png'; 
                  target.onerror = null; 
              }}
            />
             <div 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200"
                onClick={handleAvatarClick}
             >
                 <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center text-sm font-medium px-2">
                 {formData.avatar ? 'Change Photo' : 'Add Photo'}
                 </span>
             </div>
          </div>
        </div>
        <input 
          type="file"
          accept="image/*"
          ref={avatarInputRef}
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
          <input id="name" name="name" value={formData.name ?? ''} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Pet Type *</label>
          <select id="type" name="type" value={formData.type ?? 'Dog'} onChange={handleInputChange} required>
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
          <input id="breed" name="breed" value={formData.breed ?? ''} onChange={handleInputChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
            <input type="number" id="age" name="age" value={String(formData.age ?? '')} onChange={handleInputChange} min="0" step="0.1" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select id="gender" name="gender" value={formData.gender ?? ''} onChange={handleInputChange}>
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
            value={formData.birthday ?? ''}
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
  
  // 渲染表单步骤4: 照片画廊
  const renderGalleryStep = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Photos</label>
        <p className="text-xs text-gray-500 mb-4">
            These are the photos currently saved for your pet. You can remove them here.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {formData.photos && formData.photos.length > 0 ? (
            formData.photos.map((photoUrl, index) => {
                // Generate the full URL for display if needed (like in Profile.tsx)
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                const displayUrl = photoUrl.startsWith('/uploads/') ? `${apiBaseUrl}${photoUrl}` : photoUrl;
                
                return (
                    <div key={index} className="relative group aspect-square">
                    <img src={displayUrl} alt={`Pet photo ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md bg-gray-200" />
                    <button 
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity"
                        aria-label="Remove photo"
                    >
                        ✕
                    </button>
                    </div>
                );
            })
          ) : (
            <p className="text-sm text-gray-500 col-span-full">No photos have been saved yet.</p>
          )}
        </div>
      </div>

      <hr className="my-6" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Photos</label>
        <p className="text-xs text-gray-500 mb-4">
            Select new photos to upload. Click the button below or drag and drop images.
        </p>
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={photoInputRef}
          className="hidden"
          accept="image/*"
          onChange={handlePhotoUpload}
          multiple
        />
        <button 
          type="button"
          onClick={handlePhotoClick}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out mb-4"
        >
          + Choose Photos to Upload
        </button>

        {/* Display newly selected files with previews */}
        {newPhotoFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">New photos to upload:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {newPhotoFiles.map((file, index) => {
                // Generate a temporary preview URL
                const previewUrl = URL.createObjectURL(file);
                
                // Important: Remember to revoke this URL later
                // We can do this in a useEffect cleanup or when removing the file

                return (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={previewUrl} 
                      alt={`Preview ${file.name}`} 
                      className="w-full h-full object-cover rounded-lg shadow-md bg-gray-200"
                      // Revoke URL when the image is no longer needed (e.g., on error or load, though cleanup effect is better)
                      // onLoad={() => URL.revokeObjectURL(previewUrl)} // Careful: might revoke too early if component re-renders
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)} // Use the new handler
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${file.name}`}
                    >
                        ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
      case 4:
        return renderGalleryStep();
      default:
        return null;
    }
  };

  // Effect to revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    // Store the generated URLs to revoke them later
    const urlsToRevoke: string[] = [];
    newPhotoFiles.forEach(file => {
      // If we were storing the URL on the file object:
      // if (file.previewUrl) urlsToRevoke.push(file.previewUrl);
      // Since we generate in map, we don't have a stable list here.
      // A better approach might be to store the URL with the file state.
      // For now, we'll rely on removing them via handleRemoveNewPhoto and maybe a less precise cleanup.
    });

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