import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';

interface UserProfileFormProps {
  user: User;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  onCancel: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  user, 
  onSubmit, 
  onCancel 
}) => {
  // State for form data
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name || '',
    email: user.email || '',
    location: user.location || '',
    phone: user.phone || '',
    bio: user.bio || '',
    interests: user.interests || [],
    avatar: user.avatar || '',
    photos: user.photos || []
  });
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [newInterest, setNewInterest] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  // 确保文件输入引用正确初始化
  useEffect(() => {
    console.log("Refs initialized:", {
      avatarRef: !!fileInputRef.current,
      photoRef: !!photoInputRef.current
    });
  }, []);
  
  // Track window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth < 768;
  
  // 定义步骤
  const steps = [
    { title: "Basic Information", fields: ["name", "email", "phone", "location", "avatar"] },
    { title: "About Me", fields: ["bio", "interests"] },
    { title: "Photos", fields: ["photos"] }
  ];
  
  // 处理步骤切换
  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo(0, 0);
  };
  
  // 下一步
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };
  
  // 上一步
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    } else {
      onCancel();
    }
  };
  
  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 显式处理头像点击
  const handleAvatarClick = () => {
    console.log("Avatar click triggered");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("Avatar input reference is null");
    }
  };
  
  // Photo upload handlers
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Avatar file selection triggered");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 检查文件大小 (限制为 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
      }
      
      // 检查文件类型
      if (!file.type.match('image.*')) {
        alert('请选择图片文件');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const target = event.target;
        if (target && target.result) {
          setFormData(prev => ({ ...prev, avatar: target.result as string }));
          console.log("Avatar image loaded successfully");
        }
      };
      reader.onerror = () => {
        alert('图片读取失败，请重试');
      };
      reader.readAsDataURL(file);
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
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Photo file selection triggered");
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // 限制上传数量
      if (formData.photos && formData.photos.length + files.length > 10) {
        alert('最多只能上传10张照片');
        return;
      }
      
      // 处理每个文件
      files.forEach(file => {
        // 检查文件大小 (限制为 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`图片 ${file.name} 大小超过 5MB，已跳过`);
          return;
        }
        
        // 检查文件类型
        if (!file.type.match('image.*')) {
          alert(`文件 ${file.name} 不是图片格式，已跳过`);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const target = event.target;
          if (target && target.result) {
            setFormData(prev => ({ 
              ...prev, 
              photos: [...(prev.photos || []), target.result as string] 
            }));
            console.log(`Photo ${file.name} loaded successfully`);
          }
        };
        reader.onerror = () => {
          alert(`图片 ${file.name} 读取失败，请重试`);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
  };
  
  // Interest tag handlers
  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests?.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()]
      }));
      setNewInterest('');
    }
  };
  
  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.filter(item => item !== interest)
    }));
  };
  
  // Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Success handling can be added here
    } catch (error) {
      console.error("Error saving profile:", error);
      // Error handling can be added here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get interest tag color for rendering
  const getInterestTagColor = (index: number): string => {
    const colors = [
      'bg-mintgreen text-green-700',
      'bg-lavender text-purple-700',
      'bg-softpink text-pink-700',
      'bg-skyblue text-blue-700',
      'bg-yellow-100 text-yellow-700',
      'bg-orange-100 text-orange-700',
      'bg-red-100 text-red-700'
    ];
    return colors[index % colors.length];
  };
  
  // Content for each section
  const renderBasicInfoSection = () => (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="relative group">
          <img 
            src={formData.avatar || 'https://via.placeholder.com/150'}
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto cursor-pointer bg-gray-100"
            onClick={handleAvatarClick}
          />
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200"
            onClick={handleAvatarClick}
          >
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center text-sm font-medium px-2">
              Change Photo
            </span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled // Email usually shouldn't be changed easily
        />
        <p className="text-xs text-gray-500 mt-1">Contact support to change your email address</p>
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="City, State"
        />
      </div>
    </div>
  );
  
  const renderAboutSection = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Tell others about yourself..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.interests && formData.interests.map((interest, index) => (
            <div key={index} className={`${getInterestTagColor(index)} px-3 py-1 rounded-full flex items-center`}>
              <span className="text-sm">{interest}</span>
              <button 
                type="button"
                onClick={() => handleRemoveInterest(interest)}
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
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Add an interest..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add an interest</p>
      </div>
    </div>
  );
  
  const renderPhotosSection = () => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">My Photos</label>
      <p className="text-xs text-gray-500 mb-4">Share photos of your life with your pets. These photos will be visible to other users.</p>
      
      <input 
        type="file" 
        ref={photoInputRef}
        className="hidden"
        accept="image/*"
        onChange={handlePhotoUpload}
        multiple
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {formData.photos && formData.photos.map((photo, index) => (
          <div key={index} className="relative group aspect-square">
            <img 
              src={photo} 
              alt={`User photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemovePhoto(index)}
              className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              ×
            </button>
          </div>
        ))}
        
        <div 
          className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition border-2 border-dashed border-gray-300"
          onClick={handlePhotoClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm text-gray-500">Add Photo</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        These photos will be visible to other users looking to connect with you.
      </p>
    </div>
  );
  
  // 根据当前步骤渲染相应表单部分
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoSection();
      case 2:
        return renderAboutSection();
      case 3:
        return renderPhotosSection();
      default:
        return null;
    }
  };
  
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
            <h2 className="text-xl font-bold text-purple-700">Edit Profile</h2>
            <p className="text-xs text-gray-500">
              {isMobile 
                ? `Step ${currentStep} of ${steps.length}` 
                : `Complete all ${steps.length} sections to update your profile`
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
                    onClick={() => handleStepClick(index + 1)}
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
                  onClick={() => handleStepClick(index + 1)}
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
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h3 className="font-medium text-lg text-purple-700 mb-4">
              {steps[currentStep-1].title}
            </h3>
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
              : (isSubmitting ? 'Saving...' : 'Save Profile')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfileForm; 