
export type UserRole = 'Student' | 'Club Admin' | 'Faculty' | 'Super Admin';

export interface Transaction {
  id: string;
  eventId: string;
  eventName: string;
  amount: string;
  date: string;
  status: 'success' | 'failed';
  paymentMethod: string;
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  department?: string; // Used for Branch
  prn?: string;
  rollNo?: string;
  division?: string;
  profilePicture?: string; // Base64 or URL
  joinedClubs: string[]; // Club IDs
  pendingClubs?: string[]; // Club IDs where join request is pending
  registeredEvents?: { eventId: string; status: 'registered' | 'attended' }[];
  transactions?: Transaction[];
}

export interface Club {
  id: string;
  name: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Social' | 'Other';
  description: string;
  logoUrl: string;
  bannerUrl: string;
  memberCount: number;
  president: string;
  password?: string; // Access password for club admins
  nextEventId?: string;
  adminEmail?: string;
  // Added department property to support branch/department affiliation for clubs
  department?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  date: string; // ISO date string
  location: string;
  fee?: string;
  description: string;
  imageUrl: string;
  reminders?: string[]; // Array of ISO strings for scheduled reminders
  isLive?: boolean;
  streamUrl?: string;
  googleMapUrl?: string;
  registrationDeadline?: string; // ISO date string for last date to register
  miniAnnouncement?: string; // Mini announcement regarding the event
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Announcement {
  id: string;
  clubId: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  authorName: string;
}

export interface MembershipRequest {
  id: string;
  clubId: string;
  userEmail: string;
  userName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface MediaItem {
  id: string;
  clubId: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  timestamp: string;
}

export interface SupportRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}
