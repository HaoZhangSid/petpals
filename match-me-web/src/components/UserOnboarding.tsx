import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
  action?: {
    text: string;
    path?: string;
  };
}

interface UserOnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  showSkip?: boolean;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ 
  steps, 
  onComplete,
  showSkip = true 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const navigate = useNavigate();
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setExiting(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setExiting(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  const handleAction = () => {
    const currentAction = steps[currentStep].action;
    if (currentAction?.path) {
      navigate(currentAction.path);
    }
    handleNext();
  };

  const handleSkip = () => {
    onComplete();
  };

  // Progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
              <div 
                className="bg-gradient-to-r from-skyblue to-softpink h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Step content */}
            <div className="text-center mb-8">
              <img 
                src={steps[currentStep].image} 
                alt={steps[currentStep].title}
                className="w-40 h-40 object-cover rounded-full mx-auto mb-6 border-4 border-softpink animate-float"
              />
              <h2 className="text-2xl font-bold text-purple-700 mb-3">{steps[currentStep].title}</h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col space-y-3">
              {steps[currentStep].action ? (
                <button
                  onClick={handleAction}
                  className="bg-softpink hover:bg-pink-400 text-white py-3 px-6 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  {steps[currentStep].action.text}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-softpink hover:bg-pink-400 text-white py-3 px-6 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
                </button>
              )}
              
              {showSkip && currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 py-2 transition-colors duration-300"
                >
                  Skip for now
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Step indicators */}
        <div className="flex justify-center pb-6 space-x-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-softpink scale-125' 
                  : index < currentStep 
                    ? 'bg-skyblue' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding; 