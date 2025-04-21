import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Playdate, PlaydateType, PlaydateFilter, User } from '../../types'; // Adjust path as needed

// Props for the component
interface UpcomingPlaydatesProps {
  playdates: Playdate[];
  user: User | null; // Assuming User type is defined in types
}

// Helper function (moved from Dashboard)
const getPlaydateCardStyles = (type: PlaydateType | undefined) => {
  switch (type) {
    case 'my_event':
      return { bg: 'bg-softpink/10', border: 'border-softpink', tagBg: 'bg-pink-100', tagText: 'text-pink-600', tagIcon: '👤' };
    case 'invitation':
      return { bg: 'bg-skyblue/10', border: 'border-skyblue', tagBg: 'bg-blue-100', tagText: 'text-blue-600', tagIcon: '💌' };
    case 'friends_event':
      return { bg: 'bg-lavender/10', border: 'border-lavender', tagBg: 'bg-purple-100', tagText: 'text-purple-600', tagIcon: '👥' };
    case 'public_nearby':
      return { bg: 'bg-mintgreen/10', border: 'border-mintgreen', tagBg: 'bg-green-100', tagText: 'text-green-600', tagIcon: '🌍' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', tagBg: 'bg-gray-100', tagText: 'text-gray-500', tagIcon: '❓' };
  }
};

const UpcomingPlaydates: React.FC<UpcomingPlaydatesProps> = ({ playdates, user }) => {
  // State for the active playdate filter (moved from Dashboard)
  const [activeFilter, setActiveFilter] = useState<PlaydateFilter>('all');

  // Add CSS to hide scrollbars
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Filtering logic (moved from Dashboard)
  const filteredPlaydates = playdates.filter(playdate => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'invitation') {
      return playdate.typeForCurrentUser === 'invitation' && playdate.statusForCurrentUser === 'pending';
    }
    return playdate.typeForCurrentUser === activeFilter;
  }).sort((a, b) => {
      const dateTimeA = `${a.date} ${a.time}`;
      const dateTimeB = `${b.date} ${b.time}`;
      return dateTimeA.localeCompare(dateTimeB);
  });

  return (
     <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-6 sm:mb-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-lg font-semibold mb-2 sm:mb-0">Upcoming Playdates</h2>
          
          {/* Filter Tabs - Mobile Optimized */}
          <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
              {(['all', 'my_event', 'invitation', 'friends_event', 'public_nearby'] as PlaydateFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 sm:px-3 py-1 rounded-full transition-colors duration-200 flex-shrink-0
                    ${activeFilter === filter 
                      ? 'bg-white text-purple-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                   {filter.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Playdates Container - Mobile Optimized */}
        <div className="w-full">
          {/* Horizontal scrolling container */}
          <div className="overflow-x-auto pb-4 flex gap-2 hide-scrollbar scrolling-touch">
            {filteredPlaydates.length > 0 ? (
               filteredPlaydates.map(playdate => {
                const styles = getPlaydateCardStyles(playdate.typeForCurrentUser);
                return (
                  <div key={playdate.id} className="w-[280px] sm:w-[220px] md:w-[200px] lg:w-[240px] flex-shrink-0">
                     <div className={`${styles.bg} rounded-xl p-3 border ${styles.border} h-full flex flex-col justify-between`}>
                       {/* Top Section */}
                       <div className="flex justify-between items-start mb-2">
                         <span className={`text-xs font-medium ${styles.tagBg} ${styles.tagText} rounded-full px-2 py-0.5 flex items-center`}>
                           <span className="mr-1 text-sm">{styles.tagIcon}</span>
                           <span className="truncate max-w-[120px]">
                             {playdate.typeForCurrentUser.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                           </span>
                         </span>
                         <span className="text-xl">{playdate.icon}</span>
                       </div>
                       {/* Middle Section */}
                       <div>
                         <h3 className="font-bold text-gray-800 text-sm mb-1 truncate" title={playdate.title}>{playdate.title}</h3>
                         <div className="flex items-center text-xs text-gray-600 mb-1">
                           <span className="mr-1 text-xs flex-shrink-0">📅</span>
                           <span className="truncate">{playdate.date}, {playdate.time}</span>
                         </div>
                         <div className="flex items-center text-xs text-gray-600 mb-2">
                           <span className="mr-1 text-xs flex-shrink-0">📍</span>
                           <span className="truncate" title={playdate.location}>{playdate.location}</span>
                         </div>
                          {(playdate.typeForCurrentUser === 'public_nearby' || playdate.typeForCurrentUser === 'friends_event') && playdate.creator.id !== user?.id && (
                           <div className="flex items-center text-xs text-gray-500 mb-2">
                               {playdate.creator.avatar && (
                                 <img src={playdate.creator.avatar} alt={playdate.creator.name} className="w-4 h-4 rounded-full mr-1 flex-shrink-0"/>
                               )}
                               <span className="truncate">Created by {playdate.creator.name}</span>
                           </div>
                          )}
                       </div>
                       {/* Bottom Section */}
                       <div className="mt-auto pt-2">
                         {playdate.typeForCurrentUser === 'invitation' && playdate.statusForCurrentUser === 'pending' && (
                           <div className="flex space-x-2">
                             <button className="flex-1 bg-softpink hover:bg-pink-400 text-white px-3 py-1 rounded-full text-xs transition duration-300">Accept</button>
                             <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs transition duration-300">Decline</button>
                           </div>
                         )}
                         {playdate.typeForCurrentUser === 'public_nearby' && playdate.allowsJoinRequests && playdate.statusForCurrentUser !== 'requested' && playdate.statusForCurrentUser !== 'accepted' && (
                            <button className="w-full bg-mintgreen hover:bg-green-400 text-green-800 px-3 py-1 rounded-full text-xs transition duration-300">Request to Join</button>
                         )}
                          {playdate.typeForCurrentUser === 'public_nearby' && playdate.statusForCurrentUser === 'requested' && (
                            <button disabled className="w-full bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs cursor-not-allowed">Request Sent</button>
                         )}
                         {(playdate.statusForCurrentUser === 'accepted' || playdate.typeForCurrentUser === 'my_event' || playdate.typeForCurrentUser === 'friends_event') && !(playdate.typeForCurrentUser === 'invitation' && playdate.statusForCurrentUser === 'pending') && (
                           <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs transition duration-300">View Details</button>
                         )}
                       </div>
                     </div>
                  </div>
                );
              })
            ) : (
               <div className="text-center text-gray-500 py-8 w-full">
                   <p className="text-sm">No playdates found for this filter.</p>
               </div>
            )} 

            {/* Discover Card */}
            {(activeFilter === 'all' || activeFilter === 'public_nearby') && (
                <div className="w-[280px] sm:w-[220px] md:w-[200px] lg:w-[240px] flex-shrink-0">
                  <Link to="/discover?tab=playdates" className="block bg-gray-50 rounded-xl p-3 border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-center hover:bg-gray-100 transition group">
                      <span className="text-2xl text-gray-400 group-hover:text-skyblue transition mb-1">🌍</span>
                      <h3 className="font-medium text-gray-500 text-sm mb-0.5">Discover Nearby</h3>
                      <span className="text-skyblue text-xs group-hover:underline">Explore More →</span>
                  </Link>
                </div>
            )}
             {/* Add Card */}
             {(activeFilter === 'all' || activeFilter === 'my_event') && (
                <div className="w-[280px] sm:w-[220px] md:w-[200px] lg:w-[240px] flex-shrink-0">
                  <Link to="/playdates/new" className="block bg-gray-50 rounded-xl p-3 border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-center hover:bg-gray-100 transition group">
                    <span className="text-2xl text-gray-400 group-hover:text-softpink transition mb-1">+</span>
                    <h3 className="font-medium text-gray-500 text-sm mb-0.5">New Playdate</h3>
                    <span className="text-softpink text-xs group-hover:underline">Create Event →</span>
                  </Link>
                </div>
             )}
          </div>
          
          {/* Scroll indication */}
          <div className="hidden sm:flex justify-center mt-2">
            <div className="space-x-1">
              <span className="inline-block w-6 h-1 rounded-full bg-gray-300"></span>
              <span className="inline-block w-2 h-1 rounded-full bg-gray-200"></span>
              <span className="inline-block w-2 h-1 rounded-full bg-gray-200"></span>
            </div>
          </div>
        </div>
        
        {/* Mobile scroll hint text */}
        <p className="text-xs text-gray-400 text-center mt-2 sm:hidden">
          Swipe to see more playdates →
        </p>
      </div>
  );
};

export default UpcomingPlaydates; 