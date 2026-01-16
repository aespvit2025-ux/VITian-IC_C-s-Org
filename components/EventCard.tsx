
import React from 'react';
import { ClubEvent, Club } from '../types';
import { Calendar, MapPin, IndianRupee, CheckCircle, Bell, ArrowRight, Radio, Megaphone } from 'lucide-react';
import { Button } from './Button';

interface EventCardProps {
  event: ClubEvent;
  clubs: Club[];
  onRsvp?: (eventId: string) => void;
  onClick?: (event: ClubEvent) => void;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, clubs, onRsvp, onClick, isRegistered = false }) => {
  const club = clubs.find(c => c.id === event.clubId);
  const date = new Date(event.date);

  return (
    <div 
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors group cursor-pointer relative"
        onClick={() => onClick && onClick(event)}
    >
      <div className="h-32 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#0ea5e9] dark:text-blue-300 shadow-sm">
              {club?.category || 'Event'}
            </div>
            {event.isLive && (
                <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 animate-pulse border border-red-400">
                    <Radio size={12} /> LIVE
                </div>
            )}
        </div>
        {isRegistered && (
             <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                 <CheckCircle size={12} /> Registered
             </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[#0ea5e9] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
          {club?.name || 'Unknown Club'}
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 leading-tight">{event.title}</h3>
        
        {event.miniAnnouncement && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#0ea5e9] p-2 mb-3 rounded-r-lg animate-in fade-in slide-in-from-left-1 duration-300">
            <p className="text-[10px] font-black text-[#0ea5e9] dark:text-blue-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <Megaphone size={10} /> Update
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-tight">{event.miniAnnouncement}</p>
          </div>
        )}

        <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <Calendar size={14} className="mr-2 text-blue-500" />
                <span>{date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <MapPin size={14} className="mr-2 text-red-500" />
                <span>{event.location}</span>
            </div>
            {event.fee && (
                 <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <IndianRupee size={14} className="mr-2 text-green-600" />
                    <span>{event.fee}</span>
                </div>
            )}
        </div>

        {onRsvp && (
             <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                 <Button 
                    variant={isRegistered ? 'outline' : 'primary'} 
                    fullWidth 
                    className="py-2 text-sm flex-1"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening detail modal
                        onRsvp(event.id);
                    }}
                >
                    {isRegistered ? (
                        <span className="flex items-center justify-center gap-2">View Ticket</span>
                    ) : (
                        <span className="flex items-center justify-center gap-2"><Bell size={16}/> RSVP</span>
                    )}
                </Button>
                <button className="p-2 text-gray-400 hover:text-[#0ea5e9] dark:hover:text-blue-400 transition-colors">
                    <ArrowRight size={20} />
                </button>
             </div>
        )}
      </div>
    </div>
  );
};
