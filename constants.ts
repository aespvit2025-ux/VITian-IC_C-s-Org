
import { Club, ClubEvent, User, Announcement, MembershipRequest, NotificationItem } from './types';

export const VIT_BLUE = '#0ea5e9'; // Updated to Sky Blue

// Map venue names to percentage coordinates on the campus map (x, y)
// 0,0 is top-left; 100,100 is bottom-right
export const VENUE_COORDINATES: Record<string, { x: number; y: number }> = {
  'Auditorium, Building 2': { x: 45, y: 40 },
  'Main Ground': { x: 75, y: 60 },
  'Conference Hall': { x: 30, y: 35 },
  'Room 101, Building 1': { x: 20, y: 25 },
  'Amphitheater': { x: 60, y: 50 },
  'Library': { x: 40, y: 20 },
  'Canteen': { x: 80, y: 30 },
  'Main Entrance': { x: 50, y: 90 },
};

export const MOCK_CLUBS: Club[] = [
  {
    id: 'c1',
    name: 'Google Developer Student Clubs (GDSC)',
    category: 'Technical',
    description: 'GDSC VIT Pune is a community group for students interested in Google developer technologies. Students from all undergraduate or graduate programs with an interest in growing as a developer are welcome.',
    logoUrl: 'https://picsum.photos/100/100?random=1',
    bannerUrl: 'https://picsum.photos/600/300?random=1',
    memberCount: 450,
    president: 'Aarav Patel',
    adminEmail: 'aarav.patel@vit.edu',
    password: '1234',
    nextEventId: 'e1'
  },
  {
    id: 'c2',
    name: 'ACM Student Chapter',
    category: 'Technical',
    description: 'Association for Computing Machinery (ACM) is the world\'s largest educational and scientific computing society. We organize hackathons, coding competitions, and workshops.',
    logoUrl: 'https://picsum.photos/100/100?random=2',
    bannerUrl: 'https://picsum.photos/600/300?random=2',
    memberCount: 380,
    president: 'Isha Sharma',
    adminEmail: 'priya.verma@vit.edu',
    password: '1234'
  },
  {
    id: 'c3',
    name: 'VishwaConclave',
    category: 'Social',
    description: 'A platform for students to engage in diplomacy and international relations through Model United Nations and other debate formats.',
    logoUrl: 'https://picsum.photos/100/100?random=3',
    bannerUrl: 'https://picsum.photos/600/300?random=3',
    memberCount: 120,
    president: 'Rohan Deshmukh',
    adminEmail: 'rohan.deshmukh@vit.edu',
    password: '1234',
    nextEventId: 'e3'
  },
  {
    id: 'c4',
    name: 'V-Rock',
    category: 'Cultural',
    description: 'The official music band and club of VIT Pune. We jam, we perform, we rock!',
    logoUrl: 'https://picsum.photos/100/100?random=4',
    bannerUrl: 'https://picsum.photos/600/300?random=4',
    memberCount: 60,
    president: 'Sameer Khan',
    adminEmail: 'sameer.khan@vit.edu',
    password: '1234'
  },
  {
    id: 'c5',
    name: 'Robotics Forum',
    category: 'Technical',
    description: 'Building the future, one bot at a time. We participate in Robocon, ABU, and various national robotics competitions.',
    logoUrl: 'https://picsum.photos/100/100?random=5',
    bannerUrl: 'https://picsum.photos/600/300?random=5',
    memberCount: 200,
    president: 'Ananya Gupta',
    adminEmail: 'ananya.gupta@vit.edu',
    password: '1234',
    nextEventId: 'e2'
  }
];

export const MOCK_EVENTS: ClubEvent[] = [
  {
    id: 'e1',
    clubId: 'c1',
    title: 'Cloud Study Jam',
    date: '2023-11-15T10:00:00Z',
    location: 'Auditorium, Building 2',
    fee: 'Free',
    description: 'Learn the basics of Google Cloud Platform and earn badges. Hands-on workshop with expert guidance.',
    imageUrl: 'https://picsum.photos/600/300?random=10'
  },
  {
    id: 'e2',
    clubId: 'c5',
    title: 'RoboWars 2023',
    date: '2023-11-20T09:00:00Z',
    location: 'Main Ground',
    fee: '₹200',
    description: 'The ultimate battle of bots. Watch as student-made robots compete for glory.',
    imageUrl: 'https://picsum.photos/600/300?random=11'
  },
  {
    id: 'e3',
    clubId: 'c3',
    title: 'Diplomacy Summit',
    date: '2023-11-25T11:00:00Z',
    location: 'Conference Hall',
    fee: '₹150',
    description: 'A panel discussion with eminent diplomats and policy makers.',
    imageUrl: 'https://picsum.photos/600/300?random=12'
  }
];

export const MOCK_USERS: User[] = [
  { 
    email: 'rahul.sharma@vit.edu', 
    name: 'Rahul Sharma', 
    role: 'Student', 
    department: 'Computer Engineering', 
    joinedClubs: ['c1'],
    registeredEvents: [{ eventId: 'e1', status: 'registered' }] 
  },
  { email: 'priya.verma@vit.edu', name: 'Priya Verma', role: 'Club Admin', department: 'Information Technology', joinedClubs: ['c2'], registeredEvents: [] },
  { email: 'vikram.singh@vit.edu', name: 'Vikram Singh', role: 'Faculty', department: 'Mechanical Engineering', joinedClubs: [], registeredEvents: [] },
  { email: 'neha.gupta@vit.edu', name: 'Neha Gupta', role: 'Student', department: 'Electronics & Telecom', joinedClubs: ['c4'], registeredEvents: [] },
  { email: 'super.admin@vit.edu', name: 'System Administrator', role: 'Super Admin', department: 'Administration', joinedClubs: [], registeredEvents: [] },
  // Additional Admins for specific clubs
  { email: 'aarav.patel@vit.edu', name: 'Aarav Patel', role: 'Club Admin', department: 'Computer Engineering', joinedClubs: ['c1'], registeredEvents: [] },
  { email: 'rohan.deshmukh@vit.edu', name: 'Rohan Deshmukh', role: 'Club Admin', department: 'Mechanical Engineering', joinedClubs: ['c3'], registeredEvents: [] },
  { email: 'sameer.khan@vit.edu', name: 'Sameer Khan', role: 'Club Admin', department: 'Electronics & Telecom', joinedClubs: ['c4'], registeredEvents: [] },
  { email: 'ananya.gupta@vit.edu', name: 'Ananya Gupta', role: 'Club Admin', department: 'Artificial Intelligence', joinedClubs: ['c5'], registeredEvents: [] },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    clubId: 'c2',
    content: 'We are thrilled to announce that registrations for the annual Hackathon are now open! Visit the link in bio to register your team.',
    timestamp: '2023-10-28T09:30:00Z',
    authorName: 'Isha Sharma',
    imageUrl: 'https://picsum.photos/600/300?random=50'
  },
  {
    id: 'a2',
    clubId: 'c1',
    content: 'Reminder: The Cloud Study Jam session starts tomorrow at 10 AM. Please bring your laptops fully charged!',
    timestamp: '2023-11-14T18:00:00Z',
    authorName: 'Aarav Patel'
  }
];

export const MOCK_MEMBERSHIP_REQUESTS: MembershipRequest[] = [
  {
    id: 'r1',
    clubId: 'c2',
    userEmail: 'rohit.kumar@vit.edu',
    userName: 'Rohit Kumar',
    department: 'Computer Engineering',
    status: 'pending',
    requestDate: '2023-11-01T10:00:00Z'
  },
  {
    id: 'r2',
    clubId: 'c2',
    userEmail: 'sneha.patil@vit.edu',
    userName: 'Sneha Patil',
    department: 'Artificial Intelligence',
    status: 'pending',
    requestDate: '2023-11-02T14:20:00Z'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Event Reminder',
    message: 'Cloud Study Jam starts in 1 hour at Auditorium 2.',
    timestamp: '2023-11-15T09:00:00Z',
    read: false,
    type: 'info'
  },
  {
    id: 'n2',
    title: 'Registration Confirmed',
    message: 'Your seat for RoboWars 2023 has been confirmed.',
    timestamp: '2023-11-12T15:30:00Z',
    read: true,
    type: 'success'
  },
  {
    id: 'n3',
    title: 'Club Request Update',
    message: 'Your request to join ACM Student Chapter has been approved!',
    timestamp: '2023-11-10T11:00:00Z',
    read: true,
    type: 'success'
  }
];

export const FAQS = [
  {
    question: "How do I join a club?",
    answer: "Go to the 'Clubs' tab, explore the available clubs, select one you are interested in, and click the 'Join Club' button. The club admin will review your request."
  },
  {
    question: "Can I register for multiple events?",
    answer: "Yes, you can register for as many events as you like, provided their timings do not clash."
  },
  {
    question: "How do I get my event ticket?",
    answer: "After successful registration (and payment if applicable), you can view your ticket in the 'My Events' section or on the event details page."
  },
  {
    question: "How can I start a new club?",
    answer: "To start a new club, you need to submit a proposal to the Student Council. Please visit the Student Affairs office for the application form and guidelines."
  },
  {
    question: "Who do I contact for technical issues?",
    answer: "For app-related technical support, please use the contact form on this page or email support@vit.edu."
  }
];
