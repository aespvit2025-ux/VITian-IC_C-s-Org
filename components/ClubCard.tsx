import React from 'react';
import { Club } from '../types';
import { Users, ChevronRight } from 'lucide-react';

interface ClubCardProps {
  club: Club;
  onClick: (club: Club) => void;
  variant?: 'list' | 'grid';
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onClick, variant = 'list' }) => {
  
  if (variant === 'grid') {
    return (
      <div 
        onClick={() => onClick(club)}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-all cursor-pointer flex flex-col h-full"
      >
        <div className="h-24 relative bg-gray-200">
           <img 
             src={club.bannerUrl} 
             alt={club.name} 
             className="w-full h-full object-cover"
           />
           <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#003366] dark:text-blue-300 shadow-sm">
             {club.category}
           </div>
        </div>
        <div className="p-3 flex flex-col flex-1 relative">
           <img 
             src={club.logoUrl} 
             alt="logo" 
             className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 absolute -top-5 left-3 bg-white dark:bg-gray-700"
           />
           <div className="mt-4">
             <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">{club.name}</h3>
             <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
               <Users size={12} className="mr-1" />
               <span>{club.memberCount}</span>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // List Variant (Default)
  return (
    <div 
      onClick={() => onClick(club)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer flex items-center gap-4"
    >
      <img 
        src={club.logoUrl} 
        alt={club.name} 
        className="w-16 h-16 rounded-full object-cover border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
      />
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{club.name}</h3>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{club.category}</p>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
          <Users size={12} className="mr-1" />
          <span>{club.memberCount} Members</span>
        </div>
      </div>
      <ChevronRight className="text-gray-300 dark:text-gray-600" size={20} />
    </div>
  );
};