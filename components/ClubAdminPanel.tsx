
import React, { useState, useRef } from 'react';
import { Club, ClubEvent, Announcement, MembershipRequest, MediaItem, User } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { EventCard } from './EventCard';
import { 
  Calendar, Megaphone, Users, Plus, X, Image as ImageIcon, 
  CheckCircle, XCircle, ArrowLeft, Clock, MapPin, IndianRupee, Video, Trash2, Settings, Save, Upload, Edit2, Bell, AlertTriangle, Radio, Power, Map, Download,
  Instagram, Linkedin, Twitter, Globe, Mail, Lock
} from 'lucide-react';

// Extending ClubEvent to include a specific gallery for the event
interface ExtendedClubEvent extends ClubEvent {
  eventGallery?: string[];
}

interface ClubAdminPanelProps {
  club: Club;
  allClubs: Club[];
  setClubs: (clubs: Club[]) => void;
  events: ExtendedClubEvent[];
  setEvents: (events: ExtendedClubEvent[]) => void;
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
  requests: MembershipRequest[];
  setRequests: (requests: MembershipRequest[]) => void;
  mediaItems: MediaItem[];
  setMediaItems: (items: MediaItem[]) => void;
  users: User[];
  onBack: () => void;
}

type Tab = 'events' | 'announcements' | 'requests' | 'gallery' | 'settings';

export const ClubAdminPanel: React.FC<ClubAdminPanelProps> = ({ 
  club, allClubs, setClubs, events, setEvents, announcements, setAnnouncements, requests, setRequests, mediaItems, setMediaItems, users, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('events');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showRegistrantsModal, setShowRegistrantsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Core variables for the component
  const clubMedia = mediaItems.filter(m => m.clubId === club.id);
  const imageCount = clubMedia.filter(m => m.type === 'image').length;
  const videoCount = clubMedia.filter(m => m.type === 'video').length;

  // -- Event Form State --
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<Partial<ExtendedClubEvent>>({
    title: '',
    date: '',
    registrationDeadline: '',
    location: '',
    fee: '',
    description: '',
    imageUrl: `https://picsum.photos/600/300?random=${Date.now()}`,
    reminders: [],
    googleMapUrl: '',
    eventGallery: [],
    miniAnnouncement: ''
  });

  // -- Announcement Form State --
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    content: '',
    imageUrl: ''
  });

  // -- Media Form State --
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [mediaForm, setMediaForm] = useState<{type: 'image' | 'video', url: string, caption: string}>({
    type: 'image',
    url: '',
    caption: ''
  });

  // -- Settings Form State --
  const [settingsForm, setSettingsForm] = useState({
    logoUrl: club.logoUrl,
    bannerUrl: club.bannerUrl,
    socialLinks: {
      instagram: club.socialLinks?.instagram || '',
      linkedin: club.socialLinks?.linkedin || '',
      twitter: club.socialLinks?.twitter || '',
      website: club.socialLinks?.website || ''
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // -- Handlers --

  const handleViewRegistrants = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowRegistrantsModal(true);
  };

  const handleDownloadMedia = (url: string, fileName: string, type: 'image' | 'video') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace(/\s+/g, '_') || 'club_media'}.${type === 'video' ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.date) return;

    if (!eventForm.reminders || eventForm.reminders.length === 0) {
      alert("Please add at least one reminder date (Minimum 1, Maximum 5).");
      return;
    }

    if (editingEventId) {
      const updatedEvents = events.map(e => 
        e.id === editingEventId ? { ...e, ...eventForm } as ExtendedClubEvent : e
      );
      setEvents(updatedEvents);
    } else {
      const newEvent: ExtendedClubEvent = {
          id: `e${Date.now()}`,
          clubId: club.id,
          title: eventForm.title!,
          date: eventForm.date!,
          registrationDeadline: eventForm.registrationDeadline,
          location: eventForm.location || 'TBD',
          fee: eventForm.fee,
          description: eventForm.description || '',
          imageUrl: eventForm.imageUrl || `https://picsum.photos/600/300?random=${Date.now()}`,
          reminders: eventForm.reminders || [],
          isLive: false,
          googleMapUrl: eventForm.googleMapUrl,
          eventGallery: eventForm.eventGallery || [],
          miniAnnouncement: eventForm.miniAnnouncement
      };
      setEvents([...events, newEvent]);
    }

    setShowEventModal(false);
    setEditingEventId(null);
    setEventForm({ title: '', date: '', registrationDeadline: '', location: '', fee: '', description: '', imageUrl: `https://picsum.photos/600/300?random=${Date.now()}`, reminders: [], googleMapUrl: '', eventGallery: [], miniAnnouncement: '' });
  };

  const handleEditEvent = (event: ExtendedClubEvent) => {
    setEditingEventId(event.id);
    setEventForm({ ...event, reminders: event.reminders || [], googleMapUrl: event.googleMapUrl || '', eventGallery: event.eventGallery || [] });
    setShowEventModal(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleToggleLive = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (!event.isLive) {
      const url = window.prompt("Enter YouTube Live Stream URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID)");
      if (!url) return;
      
      const updatedEvents = events.map(e => 
        e.id === eventId ? { ...e, isLive: true, streamUrl: url } : e
      );
      setEvents(updatedEvents);
    } else {
      if (window.confirm(`End the live stream for "${event.title}"?`)) {
        const updatedEvents = events.map(e => 
          e.id === eventId ? { ...e, isLive: false, streamUrl: '' } : e
        );
        setEvents(updatedEvents);
      }
    }
  };

  const handleAddReminder = () => {
    if (!eventForm.reminders || eventForm.reminders.length >= 5) {
      alert("You can select up to 5 reminders.");
      return;
    }
    
    let defaultReminderDate = '';
    if (eventForm.date) {
        const d = new Date(eventForm.date);
        d.setDate(d.getDate() - 1);
        defaultReminderDate = d.toISOString().slice(0, 16);
    } else {
        defaultReminderDate = new Date().toISOString().slice(0, 16);
    }

    setEventForm({
        ...eventForm,
        reminders: [...(eventForm.reminders || []), defaultReminderDate]
    });
  };

  const handleUpdateReminder = (index: number, value: string) => {
    const updatedReminders = [...(eventForm.reminders || [])];
    updatedReminders[index] = value;
    setEventForm({ ...eventForm, reminders: updatedReminders });
  };

  const handleRemoveReminder = (index: number) => {
    const updatedReminders = [...(eventForm.reminders || [])];
    updatedReminders.splice(index, 1);
    setEventForm({ ...eventForm, reminders: updatedReminders });
  };

  const handlePostAnnouncement = () => {
    if (!announcementForm.content) return;

    if (editingAnnouncementId) {
      const updatedAnnouncements = announcements.map(a => 
        a.id === editingAnnouncementId ? { ...a, content: announcementForm.content, imageUrl: announcementForm.imageUrl || undefined } : a
      );
      setAnnouncements(updatedAnnouncements);
    } else {
      const newAnnouncement: Announcement = {
          id: `a${Date.now()}`,
          clubId: club.id,
          content: announcementForm.content,
          timestamp: new Date().toISOString(),
          authorName: club.president, 
          imageUrl: announcementForm.imageUrl || undefined
      };
      setAnnouncements([newAnnouncement, ...announcements]);
    }

    setShowAnnouncementModal(false);
    setEditingAnnouncementId(null);
    setAnnouncementForm({ content: '', imageUrl: '' });
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncementId(ann.id);
    setAnnouncementForm({ content: ann.content, imageUrl: ann.imageUrl || '' });
    setShowAnnouncementModal(true);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleAnnouncementImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("Announcement image is too large! Please keep it under 1 MB.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnnouncementForm({ ...announcementForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleRequestAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests(requests.filter(r => r.id !== id));
    const status = action === 'approved' ? 'Approved' : 'Rejected';
    alert(`User request ${status}`);
  };

  const handleSaveMedia = () => {
    if (!mediaForm.url) return;

    if (!editingMediaId) {
      if (mediaForm.type === 'image' && imageCount >= 5) {
        alert("Maximum 5 images allowed in the gallery.");
        return;
      }
      if (mediaForm.type === 'video' && videoCount >= 1) {
        alert("Maximum 1 video allowed in the gallery.");
        return;
      }
    } else {
      const originalItem = mediaItems.find(m => m.id === editingMediaId);
      if (originalItem && originalItem.type !== mediaForm.type) {
        if (mediaForm.type === 'image' && imageCount >= 5) {
          alert("Maximum 5 images allowed.");
          return;
        }
        if (mediaForm.type === 'video' && videoCount >= 1) {
          alert("Maximum 1 video allowed.");
          return;
        }
      }
    }

    if (editingMediaId) {
      const updatedMedia = mediaItems.map(m => 
        m.id === editingMediaId ? { ...m, type: mediaForm.type, url: mediaForm.url, caption: mediaForm.caption } : m
      );
      setMediaItems(updatedMedia);
    } else {
      const newItem: MediaItem = {
        id: `m${Date.now()}`,
        clubId: club.id,
        type: mediaForm.type,
        url: mediaForm.url,
        caption: mediaForm.caption,
        timestamp: new Date().toISOString()
      };
      setMediaItems([...mediaItems, newItem]);
    }

    setShowMediaModal(false);
    setEditingMediaId(null);
    setMediaForm({ type: 'image', url: '', caption: '' });
  };

  const handleEditMedia = (item: MediaItem) => {
    setEditingMediaId(item.id);
    setMediaForm({ type: item.type, url: item.url, caption: item.caption || '' });
    setShowMediaModal(true);
  };

  const handleDeleteMedia = (id: string) => {
     if(window.confirm("Delete this media?")) {
         setMediaItems(mediaItems.filter(m => m.id !== id));
     }
  };

  const handleSaveSettings = () => {
    const updatedClubs = allClubs.map(c => 
      c.id === club.id 
        ? { ...c, logoUrl: settingsForm.logoUrl, bannerUrl: settingsForm.bannerUrl, socialLinks: settingsForm.socialLinks } 
        : c
    );
    setClubs(updatedClubs);
    alert('Club information updated successfully!');
  };

  const handleUpdatePassword = () => {
    if (passwordForm.current !== club.password) {
      alert("Current password incorrect.");
      return;
    }
    if (!passwordForm.new || passwordForm.new !== passwordForm.confirm) {
      alert("New passwords do not match or are empty.");
      return;
    }
    
    const updatedClubs = allClubs.map(c => 
      c.id === club.id ? { ...c, password: passwordForm.new } : c
    );
    setClubs(updatedClubs);
    alert("Club access password updated successfully!");
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleResetImage = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setSettingsForm({ ...settingsForm, logoUrl: 'https://picsum.photos/100/100?random=default' });
    } else {
      setSettingsForm({ ...settingsForm, bannerUrl: 'https://picsum.photos/600/300?random=default' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const limit = type === 'banner' ? 1 * 1024 * 1024 : 200 * 1024;
      if (file.size > limit) {
        alert(`The chosen ${type} is too large! Please keep it under ${type === 'banner' ? '1 MB' : '200 KB'}.`);
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') {
          setSettingsForm({ ...settingsForm, logoUrl: result });
        } else {
          setSettingsForm({ ...settingsForm, bannerUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Media is too large! Please keep it under 2 MB.");
        e.target.value = '';
        return;
      }
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaForm({ 
          ...mediaForm, 
          url: reader.result as string,
          type: isVideo ? 'video' : 'image'
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("Event cover image is too large! Please keep it under 1 MB.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventForm({ ...eventForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleEventGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [...(eventForm.eventGallery || [])];
      
      if (newImages.length + files.length > 5) {
        alert("You can only upload up to 5 images for the event gallery.");
        e.target.value = '';
        return;
      }

      Array.from(files).forEach((file: any) => {
        if (file.size > 1 * 1024 * 1024) {
          alert(`File ${file.name} is too large! Please keep it under 1 MB.`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          setEventForm(prev => ({ ...prev, eventGallery: [...newImages] }));
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const removeGalleryImage = (index: number) => {
    const updatedGallery = [...(eventForm.eventGallery || [])];
    updatedGallery.splice(index, 1);
    setEventForm({ ...eventForm, eventGallery: updatedGallery });
  };

  const renderEventCreator = () => {
    const clubEvents = events.filter(e => e.clubId === club.id);
    return (
        <div className="space-y-4 animate-fade-in pb-20">
             <Button 
              onClick={() => {
                setEditingEventId(null);
                setEventForm({ title: '', date: '', registrationDeadline: '', location: '', fee: '', description: '', imageUrl: `https://picsum.photos/600/300?random=${Date.now()}`, reminders: [], googleMapUrl: '', eventGallery: [], miniAnnouncement: '' });
                setShowEventModal(true);
              }} 
              fullWidth 
              className="flex items-center justify-center gap-2"
             >
                 <Plus size={18} /> Create New Event
             </Button>
             <h3 className="font-bold text-gray-900 dark:text-white mt-4">Upcoming Events</h3>
             {clubEvents.length === 0 ? (
                 <p className="text-gray-500 text-sm text-center py-4 italic">No events scheduled.</p>
             ) : (
                 <div className="space-y-6">
                     {clubEvents.map(event => {
                         const registrants = users.filter(u => u.registeredEvents?.some(re => re.eventId === event.id));
                         return (
                            <div key={event.id} className="flex flex-col gap-3 group">
                                <div className="relative">
                                    <EventCard event={event} clubs={[club]} />
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={(e) => { e.stopPropagation(); handleToggleLive(event.id); }} className={`p-2 rounded-lg shadow-lg transition-colors flex items-center gap-1 font-bold text-[10px] ${event.isLive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#0ea5e9] text-white hover:bg-sky-600'}`} title={event.isLive ? "End Stream" : "Go Live"}>
                                        {event.isLive ? <Power size={14} /> : <Radio size={14} />}
                                        {event.isLive ? "STOP" : "GO LIVE"}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleViewRegistrants(event.id); }} className="p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors" title="View Registrants"><Users size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }} className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors" title="Edit Event"><Edit2 size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors" title="Delete Event"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-500 flex flex-col gap-3">
                                    {/* Mini Announcement Quick Option */}
                                    <div className="pb-3 border-b border-gray-50 dark:border-gray-700/50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                            <Megaphone size={12} className="text-[#0ea5e9]" /> Quick Event Update
                                        </p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                className="flex-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
                                                placeholder="Write a mini announcement..."
                                                defaultValue={event.miniAnnouncement || ''}
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    if (val !== event.miniAnnouncement) {
                                                        const updatedEvents = events.map(ev => 
                                                            ev.id === event.id ? { ...ev, miniAnnouncement: val } : ev
                                                        );
                                                        setEvents(updatedEvents as ExtendedClubEvent[]);
                                                    }
                                                }}
                                            />
                                            <button className="bg-[#0ea5e9] text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter hover:bg-sky-600 transition-colors">
                                                UPDATE
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                            <Mail size={12} className="text-[#0ea5e9]" /> Registered Users ({registrants.length})
                                        </p>
                                        {registrants.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {registrants.map((r, idx) => (
                                                    <span key={idx} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-sky-300 px-2.5 py-1 rounded-lg font-bold border border-blue-100 dark:border-blue-800">
                                                        {r.email}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-gray-400 italic">No users registered for this event yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                         );
                     })}
                 </div>
             )}
        </div>
    );
  };

  const renderAnnouncements = () => {
    const clubAnnouncements = announcements.filter(a => a.clubId === club.id);
    return (
        <div className="space-y-4 animate-fade-in pb-20">
             <Button onClick={() => { 
               setEditingAnnouncementId(null);
               setAnnouncementForm({ content: '', imageUrl: '' });
               setShowAnnouncementModal(true); 
             }} fullWidth variant="secondary" className="flex items-center justify-center gap-2">
                 <Megaphone size={18} /> Post Announcement
             </Button>
             <div className="space-y-4 mt-4">
                 {clubAnnouncements.map(ann => (
                     <div key={ann.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                         <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEditAnnouncement(ann)} className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg"><Edit2 size={14} /></button>
                             <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg"><Trash2 size={14} /></button>
                         </div>
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-[#0ea5e9] dark:text-blue-300">{ann.authorName[0]}</div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">{ann.authorName}</p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ann.timestamp).toLocaleDateString()}</p>
                             </div>
                         </div>
                         <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{ann.content}</p>
                         {ann.imageUrl && <img src={ann.imageUrl} alt="Announcement" className="mt-3 rounded-xl w-full h-48 object-cover" />}
                     </div>
                 ))}
                 {clubAnnouncements.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">No announcements yet.</p>}
             </div>
        </div>
    );
  };

  const renderRequests = () => {
    const clubRequests = requests.filter(r => r.clubId === club.id && r.status === 'pending');
    return (
        <div className="space-y-4 animate-fade-in pb-20">
             <h3 className="font-bold text-gray-900 dark:text-white">Pending Requests ({clubRequests.length})</h3>
             {clubRequests.length === 0 ? (
                 <div className="text-center py-8 text-gray-500"><CheckCircle className="mx-auto mb-2 opacity-20" size={48} /><p>All caught up!</p></div>
             ) : (
                 <div className="space-y-3">
                     {clubRequests.map(req => (
                         <div key={req.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h4 className="font-bold text-gray-900 dark:text-white">{req.userName}</h4>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">{req.userEmail}</p>
                                     <span className="inline-block mt-1 text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{req.department}</span>
                                 </div>
                                 <span className="text-[10px] text-gray-400">{new Date(req.requestDate).toLocaleDateString()}</span>
                             </div>
                             <div className="flex gap-2 mt-1">
                                 <button onClick={() => handleRequestAction(req.id, 'approved')} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"><CheckCircle size={16} /> Approve</button>
                                 <button onClick={() => handleRequestAction(req.id, 'rejected')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"><XCircle size={16} /> Reject</button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    );
  };

  const renderGallery = () => {
    return (
        <div className="space-y-4 animate-fade-in pb-20">
             <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>Club Gallery</span>
                <span className={imageCount === 0 ? 'text-red-500' : 'text-[#0ea5e9]'}>
                    Images: {imageCount}/5 {imageCount === 0 && '(Min 1 required)'} | Videos: {videoCount}/1
                </span>
            </div>

            {imageCount === 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle size={14} /> 
                    Gallery needs at least one image to be active.
                </div>
            )}

            <Button onClick={() => { setEditingMediaId(null); setMediaForm({ type: 'image', url: '', caption: '' }); setShowMediaModal(true); }} fullWidth className="flex items-center justify-center gap-2"><Plus size={18} /> Upload Media</Button>
            
             <div className="grid grid-cols-2 gap-3 mt-4">
                {clubMedia.map(item => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {item.type === 'image' ? <img src={item.url} alt={item.caption} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-900 relative"><Video size={32} className="text-white opacity-50" /><div className="absolute inset-0 flex items-center justify-center"><span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded">Video</span></div></div>}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => handleDownloadMedia(item.url, item.caption || 'media', item.type)} className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm" title="Download"><Download size={14} /></button>
                            <button onClick={() => handleEditMedia(item)} className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteMedia(item.id)} className="bg-red-500 text-white p-1.5 rounded-lg shadow-sm"><Trash2 size={14} /></button>
                        </div>
                        {item.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2"><p className="text-white text-xs truncate">{item.caption}</p></div>}
                    </div>
                ))}
             </div>
        </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Settings size={20} className="text-[#0ea5e9] dark:text-blue-400" /> Club Branding</h3>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 bg-sky-50 dark:bg-sky-900/30 px-3 py-1.5 rounded-lg"
            >
              <Lock size={14} /> Change Password
            </button>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Club Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative"><img src={settingsForm.logoUrl} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700" alt="Logo preview" /></div>
              <div className="flex-1 space-y-3">
                <input type="file" accept="image/*" id="logo-upload" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                <label htmlFor="logo-upload" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium shadow-sm"><Upload size={16} /> Choose Logo File</label>
                <button onClick={() => handleResetImage('logo')} className="text-xs text-red-500 font-medium flex items-center gap-1 hover:underline ml-1"><Trash2 size={12} /> Reset Logo</button>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Club Banner
            </label>
            <div className="space-y-3">
              <div className="h-32 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"><img src={settingsForm.bannerUrl} className="w-full h-full object-cover" alt="Banner preview" /></div>
              <input type="file" accept="image/*" id="banner-upload" className="hidden" onChange={(e) => handleFileChange(e, 'banner')} />
              <label htmlFor="banner-upload" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium shadow-sm"><Upload size={16} /> Choose Banner File</label>
              <button onClick={() => handleResetImage('banner')} className="text-xs text-red-500 font-medium flex items-center gap-1 hover:underline ml-1"><Trash2 size={12} /> Reset Banner</button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">Social Media & Connect</h4>
            <div className="grid gap-3">
               <div className="flex items-center gap-3">
                  <div className="bg-pink-50 p-2 rounded-lg text-pink-600"><Instagram size={18} /></div>
                  <Input 
                    placeholder="Instagram URL" 
                    value={settingsForm.socialLinks.instagram} 
                    onChange={e => setSettingsForm({...settingsForm, socialLinks: {...settingsForm.socialLinks, instagram: e.target.value}})} 
                  />
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-700"><Linkedin size={18} /></div>
                  <Input 
                    placeholder="LinkedIn URL" 
                    value={settingsForm.socialLinks.linkedin} 
                    onChange={e => setSettingsForm({...settingsForm, socialLinks: {...settingsForm.socialLinks, linkedin: e.target.value}})} 
                  />
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-sky-50 p-2 rounded-lg text-sky-500"><Twitter size={18} /></div>
                  <Input 
                    placeholder="Twitter URL" 
                    value={settingsForm.socialLinks.twitter} 
                    onChange={e => setSettingsForm({...settingsForm, socialLinks: {...settingsForm.socialLinks, twitter: e.target.value}})} 
                  />
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600"><Globe size={18} /></div>
                  <Input 
                    placeholder="Official Website" 
                    value={settingsForm.socialLinks.website} 
                    onChange={e => setSettingsForm({...settingsForm, socialLinks: {...settingsForm.socialLinks, website: e.target.value}})} 
                  />
               </div>
            </div>
          </div>

          <Button fullWidth onClick={handleSaveSettings} className="flex items-center justify-center gap-2 mt-4"><Save size={18} /> Save Changes</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <div className="bg-[#0ea5e9] dark:bg-gray-800 p-4 sticky top-0 z-30 shadow-md">
         <div className="flex items-center gap-3 text-white mb-4">
             <button onClick={onBack} className="hover:bg-white/10 p-1 rounded-full"><ArrowLeft size={24} /></button>
             <div><h1 className="text-lg font-bold">Admin Panel</h1><p className="text-xs opacity-80">{club.name}</p></div>
         </div>
         <div className="flex p-1 bg-black/20 rounded-xl backdrop-blur-sm overflow-x-auto no-scrollbar">
            {(['events', 'announcements', 'requests', 'gallery', 'settings'] as Tab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wide rounded-lg transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-[#0ea5e9] shadow-sm' : 'text-white/70 hover:bg-white/10'}`}>{tab}</button>
            ))}
         </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
         {activeTab === 'events' && renderEventCreator()}
         {activeTab === 'announcements' && renderAnnouncements()}
         {activeTab === 'requests' && renderRequests()}
         {activeTab === 'gallery' && renderGallery()}
         {activeTab === 'settings' && renderSettings()}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Lock size={20} className="text-[#0ea5e9]" /> Security
                    </h2>
                    <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <Input 
                      label="Current Password" 
                      type="password" 
                      value={passwordForm.current} 
                      onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} 
                    />
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 space-y-4">
                      <Input 
                        label="New Password" 
                        type="password" 
                        value={passwordForm.new} 
                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} 
                      />
                      <Input 
                        label="Confirm New Password" 
                        type="password" 
                        value={passwordForm.confirm} 
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} 
                      />
                    </div>
                    <Button onClick={handleUpdatePassword} fullWidth className="mt-4">
                      Update Password
                    </Button>
                </div>
            </div>
        </div>
      )}

      {showRegistrantsModal && selectedEventId && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registered Users</h2>
                    <button onClick={() => setShowRegistrantsModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                    {users.filter(u => u.registeredEvents?.some(re => re.eventId === selectedEventId)).length > 0 ? (
                        users.filter(u => u.registeredEvents?.some(re => re.eventId === selectedEventId)).map((u, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[#0ea5e9] dark:text-blue-300 font-bold">
                                    {u.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{u.name}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-[#0ea5e9] dark:text-sky-400 font-medium">
                                        <Mail size={12} />
                                        <span className="truncate">{u.email}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Users className="mx-auto mb-3 opacity-20" size={48} />
                            <p className="text-sm font-medium">No users have registered for this event yet.</p>
                        </div>
                    )}
                </div>
                
                <Button onClick={() => setShowRegistrantsModal(false)} fullWidth className="mt-6">
                    Close
                </Button>
            </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingEventId ? 'Edit Event' : 'Create Event'}</h2>
                     <button onClick={() => { setShowEventModal(false); setEditingEventId(null); }} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <Input label="Event Title" placeholder="e.g. Coding Workshop" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Date & Time</label><input type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Deadline</label><input type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" value={eventForm.registrationDeadline} onChange={e => setEventForm({...eventForm, registrationDeadline: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fee (Optional)" placeholder="Free or ₹100" value={eventForm.fee} onChange={e => setEventForm({...eventForm, fee: e.target.value})} />
                        <Input label="Venue" placeholder="e.g. Auditorium" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
                    </div>
                    <Input label="Google Maps URL" placeholder="https://maps.app.goo.gl/..." value={eventForm.googleMapUrl} onChange={e => setEventForm({...eventForm, googleMapUrl: e.target.value})} />
                    
                    {/* Event Banner Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Event Banner
                        </label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            id="event-banner-upload" 
                            className="hidden" 
                            onChange={handleEventImageUpload} 
                        />
                        <label 
                            htmlFor="event-banner-upload" 
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium shadow-sm"
                        >
                            <Upload size={18} /> {eventForm.imageUrl && !eventForm.imageUrl.includes('picsum') ? 'Change Banner' : 'Upload Event Banner'}
                        </label>
                        {eventForm.imageUrl && !eventForm.imageUrl.includes('picsum') && (
                            <div className="mt-2 h-20 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img src={eventForm.imageUrl} className="w-full h-full object-cover" alt="Banner Preview" />
                            </div>
                        )}
                    </div>

                    {/* Event Gallery Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Event Gallery (Up to 5 images)
                        </label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            id="event-gallery-upload" 
                            className="hidden" 
                            onChange={handleEventGalleryUpload} 
                        />
                        <label 
                            htmlFor="event-gallery-upload" 
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium shadow-sm"
                        >
                            <ImageIcon size={18} /> {eventForm.eventGallery && eventForm.eventGallery.length > 0 ? 'Add/Change Gallery Images' : 'Upload Gallery Images'}
                        </label>
                        
                        {eventForm.eventGallery && eventForm.eventGallery.length > 0 && (
                            <div className="grid grid-cols-5 gap-2 mt-2">
                                {eventForm.eventGallery.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                        <button 
                                            onClick={() => removeGalleryImage(idx)}
                                            className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full shadow-md hover:bg-red-600 z-10"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] text-gray-400 font-medium italic">Admins can upload up to 5 images. Users can download these from the event details page.</p>
                    </div>

                    {/* Event Reminders Section */}
                    <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Event Reminders (1-5 dates)
                            </label>
                            <button 
                                type="button"
                                onClick={handleAddReminder}
                                disabled={(eventForm.reminders || []).length >= 5}
                                className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 disabled:opacity-50 hover:bg-sky-50 dark:hover:bg-sky-900/30 px-2 py-1 rounded-lg transition-colors"
                            >
                                <Plus size={14} /> Add Reminder
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {(eventForm.reminders || []).map((reminder, idx) => (
                                <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 flex items-center gap-2">
                                        <Bell size={14} className="text-[#0ea5e9]" />
                                        <input 
                                            type="datetime-local" 
                                            className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white text-xs"
                                            value={reminder}
                                            onChange={(e) => handleUpdateReminder(idx, e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveReminder(idx)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button onClick={handleSaveEvent} fullWidth className="mt-4">{editingEventId ? 'Save Changes' : 'Publish Event'}</Button>
                </div>
            </div>
        </div>
      )}

      {showAnnouncementModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
               <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                   <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingAnnouncementId ? 'Edit Announcement' : 'New Announcement'}</h2><button onClick={() => { setShowAnnouncementModal(false); setEditingAnnouncementId(null); }} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button></div>
                   <textarea className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-[120px]" placeholder="Update..." value={announcementForm.content} onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})} />
                   <div className="mt-4 space-y-2">
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                       <input type="file" accept="image/*" id="announcement-image-upload" className="hidden" onChange={handleAnnouncementImageUpload} />
                       <label htmlFor="announcement-image-upload" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium shadow-sm"><Upload size={18} /> {announcementForm.imageUrl ? 'Change Image' : 'Upload Image'}</label>
                       {announcementForm.imageUrl && <div className="relative inline-block mt-2"><img src={announcementForm.imageUrl} className="h-32 w-full object-cover rounded-xl border border-gray-200 dark:border-gray-700" alt="Preview" /><button onClick={() => setAnnouncementForm({ ...announcementForm, imageUrl: '' })} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg z-10"><X size={14} /></button></div>}
                   </div>
                   <Button onClick={handlePostAnnouncement} fullWidth className="mt-6">{editingAnnouncementId ? 'Save Changes' : 'Post Now'}</Button>
               </div>
          </div>
      )}

      {showMediaModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
               <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                   <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingMediaId ? 'Edit Media' : 'Upload Media'}</h2><button onClick={() => { setShowMediaModal(false); setEditingMediaId(null); }} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button></div>
                   <div className="space-y-4">
                       <div className="flex gap-2">
                            <button 
                                onClick={() => setMediaForm({...mediaForm, type: 'image'})} 
                                disabled={!editingMediaId && imageCount >= 5}
                                className={`flex-1 p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 ${mediaForm.type === 'image' ? 'border-[#0ea5e9] bg-blue-50 text-[#0ea5e9]' : 'border-gray-200'}`}
                            >
                                <ImageIcon size={20} /> 
                                <span className="text-[10px] font-bold">Image ({imageCount}/5)</span>
                            </button>
                            <button 
                                onClick={() => setMediaForm({...mediaForm, type: 'video'})} 
                                disabled={!editingMediaId && videoCount >= 1}
                                className={`flex-1 p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 ${mediaForm.type === 'video' ? 'border-[#0ea5e9] bg-blue-50 text-[#0ea5e9]' : 'border-gray-200'}`}
                            >
                                <Video size={20} /> 
                                <span className="text-[10px] font-bold">Video ({videoCount}/1)</span>
                            </button>
                       </div>
                       <div className="space-y-2">
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Choose File</label>
                           <input type="file" accept={mediaForm.type === 'image' ? 'image/*' : 'video/*'} id="media-upload" className="hidden" onChange={handleMediaFileChange} />
                           <label htmlFor="media-upload" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium shadow-sm"><Upload size={18} /> {mediaForm.url ? 'Change File' : `Select ${mediaForm.type}`}</label>
                       </div>
                       <Input label="Caption (Optional)" value={mediaForm.caption} onChange={e => setMediaForm({...mediaForm, caption: e.target.value})} />
                       <Button onClick={handleSaveMedia} fullWidth className="mt-2" disabled={!mediaForm.url}>{editingMediaId ? 'Save Changes' : 'Add to Gallery'}</Button>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
};
