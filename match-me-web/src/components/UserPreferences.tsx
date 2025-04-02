import React, { useState, useEffect } from 'react';

interface UserPreferencesProps {
  onSave: (preferences: UserPreferenceSettings) => void;
  initialPreferences?: UserPreferenceSettings;
}

export interface UserPreferenceSettings {
  petTypes: string[];
  maxDistance: number;
  ageRanges: {
    min: number;
    max: number;
  };
  activityLevel: string[];
  personality: string[];
  playStyles: string[];
}

const petTypeOptions = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Reptile', 'Other'];
const activityLevelOptions = ['Very Active', 'Active', 'Moderate', 'Low Energy', 'Very Calm'];
const personalityOptions = ['Friendly', 'Shy', 'Playful', 'Independent', 'Protective', 'Social', 'Curious'];
const playStyleOptions = ['Gentle', 'Rough', 'Chase', 'Fetch', 'Water Play', 'Tug of War', 'Interactive Toys'];

const UserPreferences: React.FC<UserPreferencesProps> = ({ onSave, initialPreferences }) => {
  const defaultPreferences: UserPreferenceSettings = {
    petTypes: ['Dog', 'Cat'],
    maxDistance: 25,
    ageRanges: { min: 0, max: 15 },
    activityLevel: ['Active', 'Moderate'],
    personality: ['Friendly', 'Playful'],
    playStyles: ['Gentle', 'Fetch']
  };

  const [preferences, setPreferences] = useState<UserPreferenceSettings>(initialPreferences || defaultPreferences);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCheckboxChange = (category: keyof UserPreferenceSettings, value: string) => {
    if (category === 'petTypes' || category === 'activityLevel' || category === 'personality' || category === 'playStyles') {
      const currentValues = [...preferences[category]];
      
      if (currentValues.includes(value)) {
        setPreferences({
          ...preferences,
          [category]: currentValues.filter(item => item !== value)
        });
      } else {
        setPreferences({
          ...preferences,
          [category]: [...currentValues, value]
        });
      }
    }
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      maxDistance: parseInt(e.target.value)
    });
  };

  const handleAgeChange = (min: number, max: number) => {
    setPreferences({
      ...preferences,
      ageRanges: { min, max }
    });
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center">
        <span className="mr-2">🔍</span> 
        Personalize Your Matches
      </h2>
      
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Pet Types</h3>
        <div className="flex flex-wrap gap-2">
          {petTypeOptions.map((type) => (
            <button
              key={type}
              onClick={() => handleCheckboxChange('petTypes', type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                preferences.petTypes.includes(type)
                  ? 'bg-skyblue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-2">
          Max Distance: {preferences.maxDistance} km
        </h3>
        <input
          type="range"
          min="1"
          max="100"
          value={preferences.maxDistance}
          onChange={handleDistanceChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-softpink"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 km</span>
          <span>50 km</span>
          <span>100 km</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-2">
          Age Range: {preferences.ageRanges.min} - {preferences.ageRanges.max === 15 ? '15+' : preferences.ageRanges.max} years
        </h3>
        <div className="relative h-2 bg-gray-200 rounded-lg mt-6 mb-4">
          <div
            className="absolute h-full bg-softpink rounded-lg"
            style={{
              left: `${(preferences.ageRanges.min / 15) * 100}%`,
              right: `${100 - ((preferences.ageRanges.max / 15) * 100)}%`
            }}
          ></div>
          <input
            type="range"
            min="0"
            max="15"
            value={preferences.ageRanges.min}
            onChange={(e) => handleAgeChange(parseInt(e.target.value), preferences.ageRanges.max)}
            className="absolute w-full h-2 opacity-0 cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="15"
            value={preferences.ageRanges.max}
            onChange={(e) => handleAgeChange(preferences.ageRanges.min, parseInt(e.target.value))}
            className="absolute w-full h-2 opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0 yrs</span>
          <span>5 yrs</span>
          <span>10 yrs</span>
          <span>15+ yrs</span>
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-center text-skyblue hover:text-blue-600 mb-4 font-medium"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Preferences 
        <span className="ml-1">
          {showAdvanced ? '▲' : '▼'}
        </span>
      </button>
      
      {showAdvanced && (
        <>
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Activity Level</h3>
            <div className="flex flex-wrap gap-2">
              {activityLevelOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => handleCheckboxChange('activityLevel', level)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    preferences.activityLevel.includes(level)
                      ? 'bg-mintgreen text-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Personality</h3>
            <div className="flex flex-wrap gap-2">
              {personalityOptions.map((trait) => (
                <button
                  key={trait}
                  onClick={() => handleCheckboxChange('personality', trait)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    preferences.personality.includes(trait)
                      ? 'bg-lavender text-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Play Style</h3>
            <div className="flex flex-wrap gap-2">
              {playStyleOptions.map((style) => (
                <button
                  key={style}
                  onClick={() => handleCheckboxChange('playStyles', style)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    preferences.playStyles.includes(style)
                      ? 'bg-softpink text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      <button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-skyblue to-softpink text-white py-3 px-4 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg mt-4"
      >
        Apply Preferences
      </button>
    </div>
  );
};

export default UserPreferences; 