
import React, { useState, useEffect, useRef } from 'react';
import { User, Club, ChatMessage, UserRole, ClubEvent, Announcement, MembershipRequest, Transaction, NotificationItem, MediaItem, SupportRequest } from './types';
import { MOCK_CLUBS, MOCK_EVENTS, MOCK_USERS, MOCK_ANNOUNCEMENTS, MOCK_MEMBERSHIP_REQUESTS, MOCK_NOTIFICATIONS } from './constants';
import { generateAIResponse } from './services/geminiService';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { ClubCard } from './components/ClubCard';
import { EventCard } from './components/EventCard';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { ClubAdminPanel } from './components/ClubAdminPanel';
import { CalendarView } from './components/CalendarView';
import { PaymentModal } from './components/PaymentModal';
import { TicketModal } from './components/TicketModal';
import { EventDetailModal } from './components/EventDetailModal';
import { AboutVIT } from './components/AboutVIT';
import { ContactSupport } from './components/ContactSupport';
import { NotificationsView } from './components/NotificationsView';
import { EditProfile } from './components/EditProfile';
import { 
  Home, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Send, 
  ChevronLeft,
  Filter,
  Shield,
  Loader2,
  Sparkles,
  Calendar,
  HelpCircle,
  Moon,
  Sun,
  Users,
  Mail,
  ArrowRight,
  Lock,
  CheckCircle,
  GraduationCap,
  Briefcase,
  UserCog,
  Clock,
  LayoutList,
  CalendarDays,
  Bell,
  Ticket,
  Receipt,
  Info,
  MessageCircleQuestion,
  ChevronRight,
  PlayCircle,
  Download,
  Instagram,
  Linkedin,
  Twitter,
  Globe
} from 'lucide-react';

// --- Types ---
type Screen = 'login' | 'home' | 'events' | 'clubs' | 'profile' | 'support' | 'club-detail' | 'super-admin' | 'club-admin' | 'about' | 'contact-support' | 'notifications' | 'edit-profile';
type LoginStep = 'landing' | 'email' | 'otp';
type ClubTab = 'explore' | 'my-clubs';
type EventTab = 'upcoming' | 'past' | 'my-events';
type EventViewMode = 'list' | 'calendar';

// --- Main App Component ---
export default function App() {
  // Persistence Init with Safety Check (Fix for White Screen)
  const getInitialUser = (): User | null => {
    try {
      const saved = localStorage.getItem('vit_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration/Sanitization: Ensure arrays exist to prevent crashes
        return {
            ...parsed,
            joinedClubs: Array.isArray(parsed.joinedClubs) ? parsed.joinedClubs : [],
            registeredEvents: Array.isArray(parsed.registeredEvents) ? parsed.registeredEvents : [],
            pendingClubs: Array.isArray(parsed.pendingClubs) ? parsed.pendingClubs : [],
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
        };
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
      // If error, clear invalid data
      localStorage.removeItem('vit_user');
    }
    return null;
  };
  
  const getInitialTheme = () => {
    return localStorage.getItem('vit_theme') === 'dark';
  };

  const [user, setUser] = useState<User | null>(getInitialUser);
  const [currentScreen, setCurrentScreen] = useState<Screen>(user ? 'home' : 'login');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // App Data State (Moved from Constants to State for CRUD)
  const [clubs, setClubs] = useState<Club[]>(MOCK_CLUBS);
  const [events, setEvents] = useState<ClubEvent[]>(MOCK_EVENTS);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>(MOCK_MEMBERSHIP_REQUESTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  
  // Media State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: 'm1',
      clubId: 'c1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=60',
      caption: 'Hackathon 2023 Winners',
      timestamp: new Date().toISOString()
    },
    {
      id: 'm2',
      clubId: 'c1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60',
      caption: 'Team Brainstorming',
      timestamp: new Date().toISOString()
    }
  ]);

  // Login Flow State
  const [loginStep, setLoginStep] = useState<LoginStep>('landing');
  const [otp, setOtp] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<{email: string, name: string} | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); 
  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [selectedDept, setSelectedDept] = useState('Computer Engineering');
  const [authError, setAuthError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Chat State (Support)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hi! I am the VIT Clubs AI. Ask me anything about clubs or events!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Explore State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeClubTab, setActiveClubTab] = useState<ClubTab>('explore');

  // Event State
  const [activeEventTab, setActiveEventTab] = useState<EventTab>('upcoming');
  const [eventViewMode, setEventViewMode] = useState<EventViewMode>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Home Page Slider State
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  // Payment, Ticket & Detail Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<ClubEvent | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketEvent, setTicketEvent] = useState<ClubEvent | null>(null);
  const [ticketTxnId, setTicketTxnId] = useState<string | undefined>(undefined);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ClubEvent | null>(null);

  // Notification Toast State
  const [notification, setNotification] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    if (user) {
      localStorage.setItem('vit_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vit_user');
    }
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vit_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (currentScreen === 'support') {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentScreen]);

  useEffect(() => {
      if (notification) {
          const timer = setTimeout(() => setNotification(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [notification]);

  // Home Banner Slider Effect
  useEffect(() => {
    if (currentScreen === 'home') {
      const bannerCount = events.length;
      if (bannerCount > 1) {
        const interval = setInterval(() => {
          setActiveBannerIndex((prev) => (prev + 1) % bannerCount);
        }, 4000);
        return () => clearInterval(interval);
      }
    }
  }, [currentScreen, events.length, activeBannerIndex]); // Include activeBannerIndex to reset interval on manual move

  // --- Handlers ---

  const handleSupportSubmit = (request: Omit<SupportRequest, 'id' | 'timestamp' | 'status'>) => {
    const newRequest: SupportRequest = {
      ...request,
      id: `sup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setSupportRequests(prev => [newRequest, ...prev]);
  };

  const resetLoginState = () => {
    setLoginStep('landing');
    setEmail('');
    setOtp('');
    setAuthError('');
    setTempAuthData(null);
    setShowRoleModal(false);
    setAdminPassword('');
    setPasswordError('');
  };

  const handleGoogleLogin = () => {
    // Mock Google Login Success
    setTempAuthData({
        email: 'student@vit.edu',
        name: 'Google User'
    });
    setShowRoleModal(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email) {
       setAuthError('Email is required.');
       return;
    }
    if (!email.endsWith('@vit.edu')) {
      setAuthError('Access restricted to @vit.edu domains.');
      return;
    }
    
    // Simulate processing
    setIsThinking(true);
    setTimeout(() => {
        setIsThinking(false);
        setLoginStep('otp');
    }, 800);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsThinking(true);

    setTimeout(() => {
        setIsThinking(false);
        if(otp === '1234') {
            // Check if user exists in mock/state DB
            const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (existingUser) {
                // Log in existing user
                setUser(existingUser);
                setCurrentScreen('home');
            } else {
                // New User Flow
                setTempAuthData({
                    email: email,
                    name: email.split('@')[0]
                });
                setShowRoleModal(true);
            }
        } else {
            setAuthError('Invalid OTP. (Try 1234)');
        }
    }, 800);
  };

  const handleRoleSelectionComplete = () => {
      if (!tempAuthData) return;
      setPasswordError('');

      if (selectedRole === 'Club Admin') {
        const adminClub = clubs.find(c => c.adminEmail?.toLowerCase() === tempAuthData.email.toLowerCase());
        if (!adminClub) {
          setPasswordError("No club found assigned to this email. Please contact the Super Admin.");
          return;
        }
        if (adminPassword !== adminClub.password) {
          setPasswordError("Incorrect club access password.");
          return;
        }
      }

      if (selectedRole === 'Super Admin') {
        if (adminPassword !== '1234') {
          setPasswordError("Incorrect system access password.");
          return;
        }
      }

      setUser({
        email: tempAuthData.email,
        name: tempAuthData.name,
        role: selectedRole,
        department: selectedDept,
        joinedClubs: [], // Initialize empty, will be assigned by Super Admin if Club Admin
        pendingClubs: [],
        registeredEvents: []
      });
      setShowRoleModal(false);
      setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    resetLoginState();
    setCurrentScreen('login');
    setMessages([{ id: '1', role: 'model', text: 'Hi! I am the VIT Clubs AI. Ask me anything about clubs or events!' }]);
  };

  const handleClubClick = (club: Club) => {
    setSelectedClub(club);
    setCurrentScreen('club-detail');
  };

  const handleJoinClubRequest = () => {
    if (!user || !selectedClub) return;

    // Simulate sending a request
    const newRequest: MembershipRequest = {
        id: `r${Date.now()}`,
        clubId: selectedClub.id,
        userEmail: user.email,
        userName: user.name,
        department: user.department || 'General',
        status: 'pending',
        requestDate: new Date().toISOString()
    };

    setMembershipRequests([...membershipRequests, newRequest]);

    // Update local user state to reflect pending status
    setUser({
        ...user,
        pendingClubs: [...(user.pendingClubs || []), selectedClub.id]
    });
  };

  const handleEventClick = (event: ClubEvent) => {
      setSelectedEventDetail(event);
  };

  const handleRsvp = (eventId: string) => {
      if (!user) return;
      
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const isRegistered = user.registeredEvents?.some(re => re.eventId === eventId);
      
      if (isRegistered) {
          // If registered, show ticket instead of unregistering immediately
          setTicketEvent(event);
          // Try to find transaction ID
          const txn = user.transactions?.find(t => t.eventId === eventId);
          setTicketTxnId(txn?.id);
          setShowTicketModal(true);
      } else {
          // CHECK REGISTRATION DEADLINE
          if (event.registrationDeadline) {
              const deadline = new Date(event.registrationDeadline);
              const now = new Date();
              if (now > deadline) {
                  setNotification("Registration Closed! The deadline has passed.");
                  return;
              }
          }

          // Check if Free or Paid
          const isPaid = event.fee && event.fee !== 'Free' && parseInt(event.fee.replace(/[^0-9]/g, '')) > 0;

          if (isPaid) {
              setSelectedEventForPayment(event);
              setShowPaymentModal(true);
          } else {
              // Register Free Event
              const updatedUser = {
                  ...user,
                  registeredEvents: [...(user.registeredEvents || []), { eventId, status: 'registered' as const }]
              };
              setUser(updatedUser);
              setNotification("Registered Successfully! Reminder set.");
          }
      }
  };

  const handlePaymentSuccess = (transactionId: string, method: string) => {
      if (!user || !selectedEventForPayment) return;

      const newTransaction: Transaction = {
          id: transactionId,
          eventId: selectedEventForPayment.id,
          eventName: selectedEventForPayment.title,
          amount: selectedEventForPayment.fee || '0',
          date: new Date().toISOString(),
          status: 'success',
          paymentMethod: method
      };

      const updatedUser = {
          ...user,
          registeredEvents: [...(user.registeredEvents || []), { eventId: selectedEventForPayment.id, status: 'registered' as const }],
          transactions: [...(user.transactions || []), newTransaction]
      };

      setUser(updatedUser);
      setShowPaymentModal(false);
      setNotification("Payment Successful! Ticket generated.");

      // Open Ticket
      setTicketEvent(selectedEventForPayment);
      setTicketTxnId(transactionId);
      setShowTicketModal(true);
      setSelectedEventForPayment(null);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput
    };

    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsThinking(true);

    const aiResponseText = await generateAIResponse(chatInput);

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: aiResponseText
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsThinking(false);
  };

  const handleSaveProfile = (updatedUser: User) => {
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
    setCurrentScreen('profile');
    setNotification("Profile updated successfully!");
  };

  const handleDownloadMedia = (url: string, fileName: string, type: 'image' | 'video') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace(/\s+/g, '_') || 'vit_media'}.${type === 'video' ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Banner Slider Swipe Handlers ---
  const handleBannerDragStart = (clientX: number) => {
    setSwipeStartX(clientX);
  };

  const handleBannerDragEnd = (clientX: number) => {
    if (swipeStartX === null) return;
    const diff = swipeStartX - clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe Left -> Next
        setActiveBannerIndex((prev) => (prev + 1) % events.length);
      } else {
        // Swipe Right -> Prev
        setActiveBannerIndex((prev) => (prev - 1 + events.length) % events.length);
      }
    }
    setSwipeStartX(null);
  };

  // --- Shared Header Components ---
  const ProfileIconButton = () => (
    <button 
        onClick={() => setCurrentScreen('profile')}
        className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center text-[#0ea5e9] dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors shadow-sm overflow-hidden"
  >
        {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
        ) : (
            <UserIcon size={24} />
        )}
    </button>
  );

  // --- Renders ---

  const renderLogin = () => (
    <div className="min-h-screen relative bg-gray-900 flex flex-col">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop" 
            alt="VIT Campus" 
            className="w-full h-full object-cover opacity-50"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0ea5e9]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-12">
        <div className="mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">VIT Clubs Hub</h1>
            <p className="text-sky-100 text-lg">Discover. Connect. Lead.</p>
        </div>

        {/* Step: Landing */}
        {loginStep === 'landing' && (
            <div className="space-y-4 animate-fade-in">
                 <Button 
                    onClick={handleGoogleLogin}
                    fullWidth 
                    className="bg-white text-black hover:bg-gray-100 border-none flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                 </Button>

                 <Button 
                    onClick={() => setLoginStep('email')}
                    fullWidth 
                    className="bg-transparent border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                 >
                    <Mail className="w-5 h-5 mr-2 inline" />
                    Continue with Email
                 </Button>

                 <p className="text-center text-xs text-white/40 mt-4">
                    By continuing, you agree to VIT's Terms of Service & Privacy Policy.
                 </p>
            </div>
        )}

        {/* Step: Email Input */}
        {loginStep === 'email' && (
            <form onSubmit={handleEmailSubmit} className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 animate-fade-in">
                <button 
                    type="button" 
                    onClick={() => setLoginStep('landing')}
                    className="text-white/60 hover:text-white mb-4 flex items-center gap-1 text-sm"
                >
                    <ChevronLeft size={16} /> Back
                </button>
                <h2 className="text-xl font-bold text-white mb-4">Institutional Login</h2>
                <Input 
                    type="email" 
                    placeholder="student@vit.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={authError}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white focus:ring-white/20 mb-4"
                    autoFocus
                />
                <Button 
                    type="submit" 
                    fullWidth 
                    disabled={isThinking}
                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                >
                    {isThinking ? <Loader2 className="animate-spin mx-auto" /> : 'Send OTP'}
                </Button>
            </form>
        )}

        {/* Step: OTP Input */}
        {loginStep === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 animate-fade-in">
                <button 
                    type="button" 
                    onClick={() => setLoginStep('email')}
                    className="text-white/60 hover:text-white mb-4 flex items-center gap-1 text-sm"
                >
                    <ChevronLeft size={16} /> Change Email
                </button>
                <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-white/60 text-sm mb-6">We sent a verification code to {email}</p>
                
                <div className="mb-6">
                    <Input 
                        type="text" 
                        placeholder="0000" 
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        error={authError}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white focus:ring-white/20 text-center text-2xl tracking-widest"
                        autoFocus
                    />
                </div>

                <Button 
                    type="submit" 
                    fullWidth 
                    disabled={isThinking}
                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                >
                    {isThinking ? <Loader2 className="animate-spin mx-auto" /> : 'Verify & Login'}
                </Button>
                <div className="text-center mt-4">
                     <button type="button" className="text-xs text-white/50 hover:text-white underline">Resend Code</button>
                </div>
            </form>
        )}
      </div>

      {/* Role Selection Modal Overlay */}
      {showRoleModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in zoom-in duration-300 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 w-full max-md rounded-3xl p-6 shadow-2xl my-auto">
                <button 
                    onClick={() => setShowRoleModal(false)}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 flex items-center gap-1 text-sm font-medium"
                >
                    <ChevronLeft size={16} /> Back
                </button>
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserCog className="text-[#0ea5e9] dark:text-sky-300" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finalize Setup</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Select your role to access the dashboard</p>
                </div>

                <div className="space-y-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Who are you?</label>
                    <div className="grid grid-cols-1 gap-3">
                        {(['Student', 'Club Admin', 'Faculty', 'Super Admin'] as UserRole[]).map((role) => (
                            <button
                                key={role}
                                onClick={() => {
                                  setSelectedRole(role);
                                  setPasswordError('');
                                }}
                                className={`flex items-center p-3 rounded-xl border transition-all ${
                                    selectedRole === role 
                                    ? 'border-[#0ea5e9] bg-sky-50 dark:bg-sky-900/20 dark:border-sky-400 ring-1 ring-[#0ea5e9] dark:ring-sky-400' 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedRole === role ? 'bg-[#0ea5e9] text-white dark:bg-sky-500' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                                    {role === 'Student' && <GraduationCap size={16} />}
                                    {role === 'Club Admin' && <Briefcase size={16} />}
                                    {role === 'Faculty' && <CheckCircle size={16} />}
                                    {role === 'Super Admin' && <Shield size={16} />}
                                </div>
                                <div className="text-left">
                                    <div className={`font-semibold text-sm ${selectedRole === role ? 'text-[#0ea5e9] dark:text-sky-300' : 'text-gray-900 dark:text-white'}`}>{role}</div>
                                </div>
                                {selectedRole === role && <CheckCircle size={18} className="ml-auto text-[#0ea5e9] dark:text-sky-400" />}
                            </button>
                        ))}
                    </div>

                    {(selectedRole === 'Club Admin' || selectedRole === 'Super Admin') && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <Input 
                          type="password"
                          label={selectedRole === 'Club Admin' ? "Club Access Password" : "System Access Password"}
                          placeholder={selectedRole === 'Club Admin' ? "Enter your club's password" : "Enter super admin password"}
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          error={passwordError}
                        />
                      </div>
                    )}

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Department</label>
                    <select 
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-[#0ea5e9]"
                    >
                        <option>Computer Engineering</option>
                        <option>Information Technology</option>
                        <option>Mechanical Engineering</option>
                        <option>Electronics & Telecom</option>
                        <option>Artificial Intelligence</option>
                        <option>Administration</option>
                    </select>
                </div>

                <Button onClick={handleRoleSelectionComplete} fullWidth>
                    Continue to Dashboard <ArrowRight size={18} className="ml-2 inline" />
                </Button>
            </div>
        </div>
      )}
    </div>
  );
  
  const renderHome = () => {
    const myEvents = events.filter(event => user?.registeredEvents?.some(re => re.eventId === event.id));
    
    return (
      <div className="space-y-6 pb-24">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0ea5e9] dark:text-white">Hello, {user?.name.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back to VIT Clubs.</p>
          </div>
          <div className="flex items-center gap-3">
              <button 
                  onClick={() => setCurrentScreen('notifications')}
                  className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 relative hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                  <Bell size={20} />
                  {notifications.some(n => !n.read) && (
                      <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                  )}
              </button>
              <ProfileIconButton />
          </div>
        </header>

        {/* Banner Slider */}
        <div 
          className="relative h-48 w-full overflow-hidden rounded-2xl shadow-lg cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => handleBannerDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleBannerDragEnd(e.changedTouches[0].clientX)}
          onMouseDown={(e) => handleBannerDragStart(e.clientX)}
          onMouseUp={(e) => handleBannerDragEnd(e.clientX)}
        >
          {events.map((event, index) => (
              <div 
                  key={event.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out select-none ${index === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                  <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent p-6 flex flex-col justify-center text-white pointer-events-none">
                      <span className="bg-[#0ea5e9] px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-2 w-fit shadow-md">New Event</span>
                      <h2 className="text-xl font-bold mb-1 drop-shadow-lg leading-tight max-w-[70%]">{event.title}</h2>
                      <p className="text-sky-100 text-xs mb-4 opacity-90">{new Date(event.date).toLocaleDateString()} • {event.location.split(',')[0]}</p>
                      <button 
                          className="bg-white text-[#0ea5e9] px-4 py-2 rounded-lg text-xs font-black shadow-lg active:scale-95 transition-transform w-fit pointer-events-auto"
                          onClick={() => handleEventClick(event)}
                      >
                          REGISTER NOW
                      </button>
                  </div>
              </div>
          ))}
          {/* Navigation Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {events.map((_, index) => (
                  <button 
                      key={index}
                      onClick={() => setActiveBannerIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === activeBannerIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                  />
              ))}
          </div>
        </div>

        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Clubs</h2>
            <button className="text-[#0ea5e9] dark:text-sky-400 text-xs font-medium" onClick={() => setCurrentScreen('clubs')}>View All</button>
          </div>
          {(user?.joinedClubs || []).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl text-center border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">You haven't joined any clubs yet.</p>
              <Button variant="secondary" onClick={() => setCurrentScreen('clubs')}>Find Clubs</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {clubs.filter(c => (user?.joinedClubs || []).includes(c.id)).map(club => (
                <ClubCard key={club.id} club={club} onClick={handleClubClick} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Events</h2>
            <button className="text-[#0ea5e9] dark:text-sky-400 text-xs font-medium" onClick={() => { setActiveEventTab('my-events'); setCurrentScreen('events'); }}>View All</button>
          </div>
          <div className="space-y-4">
            {myEvents.length > 0 ? (
              myEvents.slice(0, 3).map(event => (
                <EventCard 
                    key={event.id} 
                    event={event} 
                    clubs={clubs} 
                    onRsvp={handleRsvp}
                    onClick={handleEventClick}
                    isRegistered={true}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl text-center border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">You haven't registered for any events yet.</p>
                <Button variant="secondary" onClick={() => setCurrentScreen('events')}>Explore Events</Button>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderEvents = () => {
    // Determine displayed events based on tab
    const now = new Date();
    let displayEvents = events;
    
    // Sort logic
    displayEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter logic based on tabs (Only apply if in list mode)
    if (eventViewMode === 'list') {
        if (activeEventTab === 'upcoming') {
            displayEvents = displayEvents.filter(e => new Date(e.date) >= now);
        } else if (activeEventTab === 'past') {
            displayEvents = displayEvents.filter(e => new Date(e.date) < now);
            displayEvents.reverse(); // Newest past events first
        } else if (activeEventTab === 'my-events') {
             displayEvents = displayEvents.filter(e => user?.registeredEvents?.some(re => re.eventId === e.id));
        }
    } else {
        // In calendar mode, filter by selected date
        displayEvents = displayEvents.filter(e => {
            const d = new Date(e.date);
            return d.getDate() === selectedDate.getDate() && 
                   d.getMonth() === selectedDate.getMonth() && 
                   d.getFullYear() === selectedDate.getFullYear();
        });
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] pb-6">
            <header className="mb-4">
                <div className="flex justify-between items-center mb-4">
                     <h1 className="text-2xl font-bold text-[#0ea5e9] dark:text-white">Events</h1>
                     
                     {/* Header Controls */}
                     <div className="flex items-center gap-3">
                         <ProfileIconButton />
                         <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
                             <button 
                                onClick={() => setEventViewMode('list')}
                                className={`p-2 rounded-md transition-all ${eventViewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#0ea5e9] dark:text-white' : 'text-gray-400'}`}
                             >
                                 <LayoutList size={20} />
                             </button>
                             <button 
                                onClick={() => setEventViewMode('calendar')}
                                className={`p-2 rounded-md transition-all ${eventViewMode === 'calendar' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#0ea5e9] dark:text-white' : 'text-gray-400'}`}
                             >
                                 <CalendarDays size={20} />
                             </button>
                         </div>
                     </div>
                </div>

                {/* Tab Switcher (Only for List View) */}
                {eventViewMode === 'list' && (
                     <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        {(['upcoming', 'past', 'my-events'] as EventTab[]).map(tab => (
                            <button 
                                key={tab}
                                // Fix: Corrected function name from setActiveTab to setActiveEventTab
                                onClick={() => setActiveEventTab(tab)}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                                    activeEventTab === tab 
                                    ? 'bg-white dark:bg-gray-700 text-[#0ea5e9] dark:text-white shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                {tab.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-24">
                {eventViewMode === 'calendar' && (
                    <CalendarView 
                        events={events} 
                        selectedDate={selectedDate} 
                        onSelectDate={setSelectedDate} 
                    />
                )}

                <div className="space-y-4">
                    {/* Date Header for Calendar View */}
                    {eventViewMode === 'calendar' && (
                        <h3 className="font-bold text-gray-900 dark:text-white px-1">
                            {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                    )}

                    {displayEvents.length > 0 ? (
                        displayEvents.map(event => (
                            <EventCard 
                                key={event.id} 
                                event={event} 
                                clubs={clubs} 
                                onRsvp={handleRsvp}
                                onClick={handleEventClick}
                                isRegistered={user?.registeredEvents?.some(re => re.eventId === event.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <Calendar className="mx-auto mb-2 opacity-20" size={48} />
                            <p>No events found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  const renderClubs = () => {
    const categories = ['All', 'Technical', 'Cultural', 'Social', 'Sports', 'Other'];
    
    // Tab filtering
    const displayClubs = activeClubTab === 'explore' 
        ? clubs 
        : clubs.filter(c => (user?.joinedClubs || []).includes(c.id));

    // Search and Category filtering
    const filteredClubs = displayClubs.filter(club => {
      const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || club.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] pb-6">
        <header className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[#0ea5e9] dark:text-white">Clubs</h1>
            <ProfileIconButton />
          </div>
          
          {/* Tab Switcher */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
              <button 
                onClick={() => setActiveClubTab('explore')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeClubTab === 'explore' 
                    ? 'bg-white dark:bg-gray-700 text-[#0ea5e9] dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Explore
              </button>
              <button 
                onClick={() => setActiveClubTab('my-clubs')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeClubTab === 'my-clubs' 
                    ? 'bg-white dark:bg-gray-700 text-[#0ea5e9] dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                My Clubs
              </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={activeClubTab === 'explore' ? "Search for clubs..." : "Search your clubs..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-[#0ea5e9] shadow-sm transition-colors"
            />
          </div>
        </header>

        {activeClubTab === 'explore' && (
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
             {categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setFilterCategory(cat)}
                 className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                   filterCategory === cat 
                   ? 'bg-[#0ea5e9] text-white shadow-md' 
                   : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredClubs.length > 0 ? (
                activeClubTab === 'explore' ? (
                     // Masonry Grid Layout for Explore
                    <div className="grid grid-cols-2 gap-3 pb-24">
                        {filteredClubs.map(club => (
                            <ClubCard key={club.id} club={club} onClick={handleClubClick} variant="grid" />
                        ))}
                    </div>
                ) : (
                    // List Layout for My Clubs
                    <div className="space-y-3 pb-24">
                        {filteredClubs.map(club => (
                            <ClubCard key={club.id} club={club} onClick={handleClubClick} variant="list" />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-10 text-gray-500">
                <Filter className="mx-auto mb-2 opacity-20" size={48} />
                <p>No clubs found.</p>
                </div>
            )}
        </div>
      </div>
    );
  };

  const renderSupport = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <header className="mb-4 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#0ea5e9] dark:text-white flex items-center gap-2">
                        Support & Help
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Powered by VIT Gemini AI</p>
                </div>
                <ProfileIconButton />
            </header>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                            msg.role === 'user' 
                            ? 'bg-[#0ea5e9] text-gray-900 rounded-tr-none' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Loader2 className="animate-spin text-[#0ea5e9] dark:text-white" size={16} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex gap-2 transition-colors">
                <input 
                    type="text" 
                    placeholder="Ask AI Assistant..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-gray-900 dark:text-white"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isThinking}
                    className="bg-[#0ea5e9] text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0284c7] transition-colors"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6 pb-24">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors">
        <div className="w-24 h-24 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center text-[#0ea5e9] dark:text-sky-200 mx-auto mb-4 overflow-hidden border-2 border-white dark:border-gray-700">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={48} />
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">{user?.role} • {user?.department}</p>
        <p className="text-sky-600 dark:text-sky-400 text-sm font-medium mt-1">{user?.email}</p>
        {(user?.prn || user?.rollNo || user?.division) && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-4 text-xs">
            {user.prn && <span className="text-gray-500 dark:text-gray-400 font-medium">PRN: <span className="text-gray-900 dark:text-white">{user.prn}</span></span>}
            {user.rollNo && <span className="text-gray-500 dark:text-gray-400 font-medium">Roll: <span className="text-gray-900 dark:text-white">{user.rollNo}</span></span>}
            {user.division && <span className="text-gray-500 dark:text-gray-400 font-medium">Div: <span className="text-gray-900 dark:text-white">{user.division}</span></span>}
          </div>
        )}
      </div>

       {/* Payment History Section */}
       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
         <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <Receipt size={18} className="text-[#0ea5e9] dark:text-sky-400"/> Payment History
         </div>
         <div className="divide-y divide-gray-100 dark:divide-gray-700">
             {user?.transactions && user.transactions.length > 0 ? (
                 user.transactions.map(txn => (
                     <div key={txn.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                         <div>
                             <p className="text-sm font-semibold text-gray-900 dark:text-white">{txn.eventName}</p>
                             <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-sm font-bold text-[#0ea5e9] dark:text-sky-400">{txn.amount}</p>
                             <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">Success</span>
                         </div>
                     </div>
                 ))
             ) : (
                 <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                     No transactions yet.
                 </div>
             )}
         </div>
       </div>

       {/* Super Admin Dashboard Card */}
       {user?.role === 'Super Admin' && (
         <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
             <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-2">Admin Dashboard</h3>
                 <p className="text-sky-100 text-sm mb-4">Manage clubs, users, and system settings.</p>
                 <Button onClick={() => setCurrentScreen('super-admin')} className="bg-white text-sky-700 hover:bg-sky-50 border-none">
                     Access Panel
                 </Button>
             </div>
             <Shield className="absolute right-4 bottom-4 text-white opacity-20" size={80} />
         </div>
       )}

       {/* Club Admin Dashboard Card */}
       {user?.role === 'Club Admin' && (
         <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
             <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-2">Club Dashboard</h3>
                 <p className="text-sky-100 text-sm mb-4">Manage events, announcements, and requests.</p>
                 <Button onClick={() => setCurrentScreen('club-admin')} className="bg-white text-sky-700 hover:bg-sky-50 border-none">
                     Manage Club
                 </Button>
             </div>
             <Briefcase className="absolute right-4 bottom-4 text-white opacity-20" size={80} />
         </div>
       )}

       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">More Options</div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
           <button 
              onClick={() => setCurrentScreen('about')} 
              className="w-full p-4 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                 <Info size={18} className="text-sky-500"/>
                 <span>About VIT Pune</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
           </button>
           <button 
              onClick={() => setCurrentScreen('contact-support')}
              className="w-full p-4 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                 <MessageCircleQuestion size={18} className="text-green-500"/>
                 <span>Help & Support</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
           </button>
        </div>
      </div>

       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">Preferences</div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
           <button onClick={toggleTheme} className="w-full p-4 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center group">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-sky-900/30 text-sky-400' : 'bg-gray-100 text-gray-500'}`}>
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <span>Dark Mode</span>
             </div>
             <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0ea5e9]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
             </div>
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">Account Settings</div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
           <button onClick={() => setCurrentScreen('edit-profile')} className="w-full p-4 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit Profile</button>
           <button onClick={() => setCurrentScreen('notifications')} className="w-full p-4 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Notifications</button>
        </div>
      </div>

      <Button variant="danger" fullWidth onClick={handleLogout} className="flex items-center justify-center gap-2">
        <LogOut size={18} /> Sign Out
      </Button>
      
      <p className="text-center text-xs text-gray-400 mt-4">Version 1.1.0 • VIT Pune</p>
    </div>
  );

  const renderClubDetail = () => {
    if (!selectedClub) return null;
    const isJoined = (user?.joinedClubs || []).includes(selectedClub.id);
    const isPending = (user?.pendingClubs || []).includes(selectedClub.id);
    const clubMedia = mediaItems.filter(m => m.clubId === selectedClub.id);

    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen pb-24 transition-colors">
        {/* Header Image */}
        <div className="h-48 relative">
            <img src={selectedClub.bannerUrl} className="w-full h-full object-cover" alt="banner" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button 
                onClick={() => setCurrentScreen('clubs')} 
                className="absolute top-4 left-4 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="px-6 -mt-10 relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <img src={selectedClub.logoUrl} className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 -mt-12 bg-white dark:bg-gray-700" alt="logo" />
                    <div className="flex gap-2 -mt-4">
                      {selectedClub.socialLinks?.instagram && (
                        <a href={selectedClub.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors">
                          <Instagram size={18} />
                        </a>
                      )}
                      {selectedClub.socialLinks?.linkedin && (
                        <a href={selectedClub.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                          <Linkedin size={18} />
                        </a>
                      )}
                      {selectedClub.socialLinks?.twitter && (
                        <a href={selectedClub.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors">
                          <Twitter size={18} />
                        </a>
                      )}
                      {selectedClub.socialLinks?.website && (
                        <a href={selectedClub.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                          <Globe size={18} />
                        </a>
                      )}
                      <span className="bg-sky-50 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-xs font-bold self-center ml-2">{selectedClub.category}</span>
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedClub.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">President: {selectedClub.president}</p>
                
                <Button 
                    variant={isJoined ? "outline" : "primary"} 
                    fullWidth 
                    onClick={isJoined ? undefined : handleJoinClubRequest}
                    disabled={isPending || isJoined}
                    className="disabled:opacity-80 disabled:cursor-not-allowed"
                >
                    {isJoined ? (
                        <span className="flex items-center justify-center gap-2"><CheckCircle size={18}/> Member</span>
                    ) : isPending ? (
                        <span className="flex items-center justify-center gap-2"><Clock size={18}/> Requested</span>
                    ) : "Join Club"}
                </Button>
            </div>

            <div className="mt-6 space-y-6">
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{selectedClub.description}</p>
                </section>

                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Upcoming Events</h3>
                    {events.filter(e => e.clubId === selectedClub.id).length > 0 ? (
                         events.filter(e => e.clubId === selectedClub.id).map(e => (
                             <EventCard 
                                key={e.id} 
                                event={e} 
                                clubs={clubs} 
                                onRsvp={handleRsvp}
                                onClick={handleEventClick}
                                isRegistered={user?.registeredEvents?.some(re => re.eventId === e.id)}
                            />
                         ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">No upcoming events scheduled.</p>
                    )}
                </section>
                
                {/* Gallery Section */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Gallery</h3>
                    {clubMedia.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {clubMedia.map(item => (
                                <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative group cursor-pointer shadow-sm">
                                     {item.type === 'image' ? (
                                         <img src={item.url} className="w-full h-full object-cover" alt="gallery" />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
                                             <PlayCircle className="text-white opacity-80" size={24} />
                                         </div>
                                     )}
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadMedia(item.url, item.caption || 'gallery_item', item.type);
                                            }}
                                            className="bg-white text-[#0ea5e9] p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                            title="Download"
                                         >
                                             <Download size={18} />
                                         </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-500 dark:text-gray-400 text-sm italic">No media uploaded.</p>
                    )}
                </section>

                {/* Announcements Section in Club Detail for Students */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Announcements</h3>
                    {announcements.filter(a => a.clubId === selectedClub.id).length > 0 ? (
                         <div className="space-y-3">
                            {announcements.filter(a => a.clubId === selectedClub.id).map(ann => (
                                <div key={ann.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-[10px] font-bold text-[#0ea5e9] dark:text-sky-300">
                                            {ann.authorName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{ann.authorName}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(ann.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{ann.content}</p>
                                    {ann.imageUrl && (
                                        <img src={ann.imageUrl} alt="Post" className="mt-2 rounded-lg w-full h-32 object-cover" />
                                    )}
                                </div>
                            ))}
                         </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">No recent announcements.</p>
                    )}
                </section>
            </div>
        </div>
      </div>
    );
  };

  // --- Main Render Flow ---

  if (currentScreen === 'super-admin') {
      return (
          <SuperAdminPanel 
            clubs={clubs} 
            setClubs={setClubs} 
            users={allUsers} 
            setUsers={setAllUsers}
            supportRequests={supportRequests}
            setSupportRequests={setSupportRequests}
            onBack={() => setCurrentScreen('profile')} 
          />
      );
  }

  if (currentScreen === 'club-admin') {
      // Find the club this user admins
      // For demo, we assume they admin the first club in their joined list
      const adminClubId = (user?.joinedClubs || [])[0];
      const adminClub = clubs.find(c => c.id === adminClubId);

      if (!adminClub) {
          return (
              <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-gray-900">
                  <Briefcase size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">No club assigned to this admin account.</p>
                  <Button onClick={() => setCurrentScreen('profile')}>Go Back</Button>
              </div>
          )
      }

      return (
          <ClubAdminPanel 
            club={adminClub} 
            allClubs={clubs}
            setClubs={setClubs}
            events={events}
            setEvents={setEvents}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            requests={membershipRequests}
            setRequests={setMembershipRequests}
            mediaItems={mediaItems}
            setMediaItems={setMediaItems}
            users={allUsers}
            onBack={() => setCurrentScreen('profile')} 
          />
      );
  }

  if (currentScreen === 'edit-profile' && user) {
    return (
      <EditProfile 
        user={user} 
        onSave={handleSaveProfile} 
        onBack={() => setCurrentScreen('profile')} 
      />
    );
  }

  if (currentScreen === 'about') {
    return <AboutVIT onBack={() => setCurrentScreen('profile')} />;
  }

  if (currentScreen === 'contact-support') {
    return <ContactSupport onBack={() => setCurrentScreen('profile')} onSubmitSupport={handleSupportSubmit} user={user} />;
  }

  if (currentScreen === 'notifications') {
      return (
          <NotificationsView 
            notifications={notifications} 
            onBack={() => setCurrentScreen('home')} 
            onClearAll={() => setNotifications([])}
          />
      );
  }

  if (currentScreen === 'login') {
    return renderLogin();
  }

  if (currentScreen === 'club-detail') {
    return renderClubDetail();
  }

  return (
    <div className={`max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen relative shadow-2xl overflow-hidden transition-colors`}>
      {/* Toast Notification */}
      {notification && (
          <div className="absolute top-4 left-4 right-4 z-[60] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <CheckCircle size={20} className="text-green-400 dark:text-green-600" />
              <span className="text-sm font-medium">{notification}</span>
          </div>
      )}

      {/* --- Modals --- */}
      {showPaymentModal && selectedEventForPayment && (
          <PaymentModal 
              event={selectedEventForPayment}
              onClose={() => {
                  setShowPaymentModal(false);
                  setSelectedEventForPayment(null);
              }}
              onSuccess={handlePaymentSuccess}
          />
      )}

      {showTicketModal && ticketEvent && user && (
          <TicketModal 
              event={ticketEvent}
              user={user}
              transactionId={ticketTxnId}
              onClose={() => setShowTicketModal(false)}
          />
      )}

      {selectedEventDetail && (
          <EventDetailModal 
              event={selectedEventDetail}
              club={clubs.find(c => c.id === selectedEventDetail.clubId)}
              onClose={() => setSelectedEventDetail(null)}
              onRsvp={handleRsvp}
              isRegistered={user?.registeredEvents?.some(re => re.eventId === selectedEventDetail.id) || false}
          />
      )}

      {/* Main Content Area */}
      <main className="p-4 h-screen overflow-y-auto no-scrollbar">
        {currentScreen === 'home' && renderHome()}
        {currentScreen === 'events' && renderEvents()}
        {currentScreen === 'clubs' && renderClubs()}
        {currentScreen === 'support' && renderSupport()}
        {currentScreen === 'profile' && renderProfile()}
      </main>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 transition-colors">
        <button 
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'home' ? 'text-[#0ea5e9] dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <Home size={22} strokeWidth={currentScreen === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
        </button>
        <button 
            onClick={() => setCurrentScreen('events')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'events' ? 'text-[#0ea5e9] dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <Calendar size={22} strokeWidth={currentScreen === 'events' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Events</span>
        </button>
        <button 
            onClick={() => setCurrentScreen('clubs')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'clubs' ? 'text-[#0ea5e9] dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <Users size={22} strokeWidth={currentScreen === 'clubs' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Clubs</span>
        </button>
        <button 
            onClick={() => setCurrentScreen('profile')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'profile' ? 'text-[#0ea5e9] dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
            <UserIcon size={22} strokeWidth={currentScreen === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Profile</span>
        </button>
        <button 
            onClick={() => setCurrentScreen('support')}
            className={`flex flex-col items-center gap-1 ${currentScreen === 'support' ? 'text-[#0ea5e9] dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
             <div className="relative">
                <HelpCircle size={22} strokeWidth={currentScreen === 'support' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium">Support</span>
        </button>
      </div>
    </div>
  );
}
