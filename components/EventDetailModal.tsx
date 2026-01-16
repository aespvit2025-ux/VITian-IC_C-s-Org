
import React from 'react';
import { ClubEvent, Club } from '../types';
import { CampusMap } from './CampusMap';
import { Button } from './Button';
import { Calendar, Clock, MapPin, IndianRupee, X, CheckCircle, Bell, Share2, Radio, Play, Users, Map as MapIcon, ExternalLink, Download, AlertCircle } from 'lucide-react';

interface ExtendedClubEvent extends ClubEvent {
  eventGallery?: string[];
}

interface EventDetailModalProps {
  event: ExtendedClubEvent;
  club?: Club;
  onClose: () => void;
  onRsvp: (eventId: string) => void;
  isRegistered: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
  event, club, onClose, onRsvp, isRegistered 
}) => {
  const dateObj = new Date(event.date);
  const deadlineObj = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const isDeadlinePassed = deadlineObj ? new Date() > deadlineObj : false;

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = event.isLive && event.streamUrl ? getYouTubeId(event.streamUrl) : null;

  const handleDownloadImage = (imgUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 overflow-y-auto animate-in slide-in-from-bottom duration-300">
        
        {/* Header Image Area */}
        <div className="relative h-64 w-full">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/50 transition-colors z-10"
            >
                <X size={24} />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6">
                 <div className="flex items-center gap-2 mb-2">
                     <span className="bg-[#0ea5e9] text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                        {club?.category || 'Event'}
                     </span>
                     {event.isLive && (
                        <div className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1 shadow-lg">
                            <Radio size={12} /> Live
                        </div>
                     )}
                 </div>
                 <h1 className="text-2xl font-bold text-white mb-1 leading-tight">{event.title}</h1>
                 <p className="text-white/80 text-sm font-medium">{club?.name}</p>
            </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-8 max-w-2xl mx-auto pb-24">
            
            {/* Registration Deadline Alert */}
            {deadlineObj && !isRegistered && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${isDeadlinePassed ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-300' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-300'}`}>
                    <AlertCircle size={20} className={isDeadlinePassed ? 'text-red-500' : 'text-orange-500'} />
                    <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest">
                            {isDeadlinePassed ? 'Registration Closed' : 'Deadline Approaching'}
                        </p>
                        <p className="text-sm font-medium">
                            {isDeadlinePassed 
                                ? `Deadline was ${deadlineObj.toLocaleDateString()} at ${deadlineObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : `Last date to register is ${deadlineObj.toLocaleDateString()} at ${deadlineObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                    </div>
                </div>
            )}

            {/* Live Stream Section */}
            {event.isLive && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gray-900 rounded-3xl overflow-hidden aspect-video relative group shadow-2xl border-4 border-red-500/20">
                         {videoId ? (
                             <iframe 
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title="YouTube live stream" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                             ></iframe>
                         ) : (
                             <>
                                <img src={event.imageUrl} className="w-full h-full object-cover opacity-40 blur-sm" alt="Stream Preview" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse cursor-pointer hover:scale-110 transition-transform">
                                        <Play size={32} fill="white" />
                                    </div>
                                    <p className="mt-4 font-black uppercase tracking-widest text-sm">Join Live Stream</p>
                                    <div className="mt-2 flex items-center gap-4 text-xs font-bold text-white/60">
                                        <span className="flex items-center gap-1 text-red-500"><Radio size={14}/> LIVE Now</span>
                                    </div>
                                </div>
                             </>
                         )}
                    </div>
                </section>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-[#0ea5e9] dark:text-blue-400">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{dateObj.toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-[#0ea5e9] dark:text-blue-400">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-[#0ea5e9] dark:text-blue-400">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Venue</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={event.location}>{event.location}</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-[#0ea5e9] dark:text-blue-400">
                        <IndianRupee size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fee</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{event.fee || 'Free'}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About Event</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {event.description}
                </p>
            </section>

            {/* Event Specific Gallery */}
            {event.eventGallery && event.eventGallery.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        Event Gallery
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {event.eventGallery.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                                <img src={img} className="w-full h-full object-cover" alt={`Event photo ${idx}`} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDownloadImage(img, `${event.title.replace(/\s+/g, '_')}_${idx}`)}
                                        className="bg-white text-[#0ea5e9] p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                                        title="Download Image"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Campus Map Integration */}
            <section>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Venue & Directions</h3>
                    {event.googleMapUrl && (
                        <button 
                            onClick={() => window.open(event.googleMapUrl, '_blank')}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <MapIcon size={14} /> Open in Google Maps <ExternalLink size={12} />
                        </button>
                    )}
                </div>
                <CampusMap event={event} category={club?.category || 'Other'} />
            </section>

        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-3 items-center z-20">
             <Button variant="outline" className="p-3">
                 <Share2 size={20} />
             </Button>
             <Button 
                fullWidth 
                onClick={() => (!isDeadlinePassed || isRegistered) ? onRsvp(event.id) : null}
                variant={isRegistered ? 'secondary' : (isDeadlinePassed ? 'outline' : 'primary')}
                disabled={isDeadlinePassed && !isRegistered}
                className="flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isRegistered ? (
                     <>
                        <CheckCircle size={20} />
                        {event.fee && event.fee !== 'Free' ? 'View Ticket' : 'Registered'}
                     </>
                ) : isDeadlinePassed ? (
                     <>
                        <AlertCircle size={20} />
                        Registration Closed
                     </>
                ) : (
                     <>
                        <Bell size={20} />
                        {event.fee && event.fee !== 'Free' ? `Book for ${event.fee}` : 'RSVP Now'}
                     </>
                )}
            </Button>
        </div>
    </div>
  );
};