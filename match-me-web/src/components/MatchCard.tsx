import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MatchReason {
  icon: string;
  text: string;
  strength: number; // 1-5, 5 being strongest match
}

export interface MatchCardProps {
  id: string;
  name: string;
  image: string;
  petType: string;
  breed?: string;
  age: number;
  distance: number;
  lastActive?: string;
  matchPercentage: number; // 0-100
  matchReasons: MatchReason[];
  ownerId: string;
  ownerName: string;
  ownerImage?: string;
  onViewProfile?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  id,
  name,
  image,
  petType,
  breed,
  age,
  distance,
  lastActive,
  matchPercentage,
  matchReasons,
  ownerId,
  ownerName,
  ownerImage,
  onViewProfile
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [liked, setLiked] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  // Format the match percentage to be more appealing
  const formatMatchPercentage = () => {
    // If it's below 70%, show it as 70% minimum to be more encouraging
    return Math.max(matchPercentage, 70);
  };

  // Get the appropriate color based on match percentage
  const getMatchColor = () => {
    if (matchPercentage >= 90) return 'from-green-400 to-green-500';
    if (matchPercentage >= 80) return 'from-teal-400 to-teal-500';
    if (matchPercentage >= 70) return 'from-blue-400 to-blue-500';
    return 'from-purple-400 to-purple-500';
  };

  // Calculate opacity for the strength indicators
  const getStrengthOpacity = (strength: number, position: number) => {
    return strength >= position ? '1' : '0.3';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden relative"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Match Percentage Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`bg-gradient-to-r ${getMatchColor()} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}>
          {formatMatchPercentage()}% Match
        </div>
      </div>

      {/* Pet Image */}
      <div 
        className="relative h-60 bg-gray-200 cursor-pointer overflow-hidden"
        onClick={toggleDetails}
      >
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className={`absolute bottom-3 right-3 p-2 rounded-full shadow-md transition-all duration-300 ${
            liked ? 'bg-softpink text-white scale-110' : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          {liked ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Basic Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-600">
              {petType} {breed ? `· ${breed}` : ''} · {age} {age === 1 ? 'year' : 'years'} old
            </p>
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <p>{distance} km away</p>
            {lastActive && <p>Active {lastActive}</p>}
          </div>
        </div>

        {/* Owner Info (compact) */}
        <div className="mt-3 flex items-center">
          <div className="mr-2 w-8 h-8 rounded-full overflow-hidden">
            <img 
              src={ownerImage || 'https://via.placeholder.com/40'} 
              alt={ownerName}
              className="w-full h-full object-cover" 
            />
          </div>
          <p className="text-sm text-gray-600">Owner: <span className="font-medium">{ownerName}</span></p>
        </div>
        
        {/* Toggle Button for Match Details */}
        <button
          onClick={toggleDetails}
          className="w-full mt-3 text-sm text-skyblue hover:text-blue-600 flex items-center justify-center"
        >
          {showDetails ? 'Hide Details' : 'Why You Match'} 
          <span className="ml-1">{showDetails ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Expandable Match Reasons */}
      {showDetails && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 animate-fade-in">
          <h4 className="text-sm font-semibold text-gray-700 my-2">Why You Match:</h4>
          <ul className="space-y-2">
            {matchReasons.map((reason, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="mr-2 text-lg">{reason.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-700">{reason.text}</p>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((pos) => (
                      <div 
                        key={pos}
                        className="w-4 h-1 bg-softpink rounded-full mr-1"
                        style={{ opacity: getStrengthOpacity(reason.strength, pos) }}
                      />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 flex justify-between gap-2">
            <button 
              onClick={onViewProfile}
              className="flex-1 text-center py-2 px-3 bg-skyblue text-white rounded-full text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              View Profile
            </button>
            <Link
              to={`/messages/new?userId=${ownerId}`}
              className="flex-1 text-center py-2 px-3 bg-softpink text-white rounded-full text-sm font-medium hover:bg-pink-500 transition-colors"
            >
              Send Message
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MatchCard; 