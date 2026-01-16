import React from 'react';
import { ClubEvent, User } from '../types';
import { Button } from './Button';
import { X, QrCode, Download, Share2, Calendar, MapPin } from 'lucide-react';

interface TicketModalProps {
  event: ClubEvent;
  user: User;
  transactionId?: string;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ event, user, transactionId, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-sm rounded-3xl overflow-hidden shadow-2xl relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 bg-black/20 text-white p-1 rounded-full hover:bg-black/40"
        >
            <X size={20} />
        </button>

        {/* Ticket Top - Event Image */}
        <div className="h-40 relative">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-xl font-bold leading-tight mb-1">{event.title}</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">Admit One</span>
            </div>
        </div>

        {/* Ticket Body - Holes Simulation */}
        <div className="relative bg-white dark:bg-gray-800">
            <div className="absolute -top-3 left-0 w-6 h-6 bg-black/80 rounded-full translate-x-[-50%]" />
            <div className="absolute -top-3 right-0 w-6 h-6 bg-black/80 rounded-full translate-x-[50%]" />
            <div className="border-b-2 border-dashed border-gray-300 dark:border-gray-600 mx-4" />
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Date & Time</p>
                    <div className="flex items-center gap-1 text-gray-900 dark:text-white text-sm font-semibold">
                        <Calendar size={14} className="text-[#0ea5e9] dark:text-blue-400" />
                        {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
                    <div className="flex items-center justify-end gap-1 text-gray-900 dark:text-white text-sm font-semibold">
                        <MapPin size={14} className="text-[#0ea5e9] dark:text-blue-400" />
                        {event.location.split(',')[0]}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">Scan this QR at the venue entrance</p>
                <div className="bg-white p-2 rounded-lg inline-block shadow-sm">
                    <QrCode size={120} className="text-black" />
                </div>
                <p className="text-xs font-mono text-gray-400 mt-2">{transactionId || `T_${user.email.split('@')[0].toUpperCase()}_${event.id}`}</p>
            </div>

            <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-bold">Attendee</p>
                <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" fullWidth className="py-2 text-sm flex items-center justify-center gap-2">
                    <Download size={16} /> Save
                </Button>
                <Button fullWidth className="py-2 text-sm flex items-center justify-center gap-2">
                    <Share2 size={16} /> Share
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};