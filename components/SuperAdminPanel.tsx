import React, { useState } from 'react';
import { Club, User, UserRole, SupportRequest } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { 
  BarChart3, Users, LayoutGrid, Plus, Edit2, 
  Search, X, Check, AlertTriangle, ArrowLeft, Briefcase, Trash2, Mail, MessageSquare, Clock, Send, Minus, Maximize2, Upload, GraduationCap
} from 'lucide-react';

interface SuperAdminPanelProps {
  clubs: Club[];
  setClubs: (clubs: Club[]) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  supportRequests: SupportRequest[];
  setSupportRequests: React.Dispatch<React.SetStateAction<SupportRequest[]>>;
  onBack: () => void;
}

type Tab = 'analytics' | 'clubs' | 'users' | 'support';

const branches = [
  "Instrumentation and Control Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Information Technology",
  "Electronics and Telecommunication Engineering",
  "Mechanical Engineering",
  "Computer Science and Engineering(Artificial Intelligence and Machine Learning)",
  "Computer Science and Engineering(Data Science)",
  "Computer Science and Engineering (Artificial Intelligence)",
  "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain Technology)",
  "Computer Engineering (Software Engineering)",
  "Artificial Intelligence and Data Science"
];

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ 
  clubs, setClubs, users, setUsers, supportRequests, setSupportRequests, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [clubFormData, setClubFormData] = useState<Partial<Club>>({});
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [selectedClubId, setSelectedClubId] = useState<string>('');

  // Calculate Statistics
  const stats = {
    students: users.filter(u => u.role === 'Student').length,
    faculty: users.filter(u => u.role === 'Faculty').length,
    clubAdmins: users.filter(u => u.role === 'Club Admin').length,
  };

  const clubMemberships = clubs.map(club => ({
    name: club.name,
    count: users.filter(u => u.joinedClubs.includes(club.id)).length,
    logo: club.logoUrl
  })).sort((a, b) => b.count - a.count);

  const handleResolveSupport = (id: string) => {
    setSupportRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'resolved' } : req));
  };

  const handleDeleteSupport = (id: string) => {
    if (window.confirm("Are you sure you want to delete this support message?")) {
      setSupportRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  const handleOpenClubModal = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      setClubFormData({ ...club });
    } else {
      setEditingClub(null);
      setClubFormData({
        name: '',
        category: 'Technical',
        description: 'A student organization at VIT Pune.',
        president: '',
        adminEmail: '',
        password: '1234',
        department: branches[0],
        memberCount: 0,
        logoUrl: `https://picsum.photos/100/100?random=${Date.now()}`,
        bannerUrl: `https://picsum.photos/600/300?random=${Date.now()}`
      });
    }
    setIsClubModalOpen(true);
  };

  const handleClubFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
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
        if (type === 'logo') setClubFormData({ ...clubFormData, logoUrl: reader.result as string });
        else setClubFormData({ ...clubFormData, bannerUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClub = () => {
    if (!clubFormData.name || !clubFormData.president || !clubFormData.adminEmail) {
      alert("Please fill all required fields.");
      return;
    }

    const clubId = editingClub ? editingClub.id : `c${Date.now()}`;
    const updatedClubData = { ...clubFormData, id: clubId, category: clubFormData.category || 'Other' } as Club;

    // 1. Update Clubs State
    if (editingClub) {
      setClubs(clubs.map(c => c.id === editingClub.id ? updatedClubData : c));
    } else {
      setClubs([...clubs, updatedClubData]);
    }

    // 2. Sync with Users State (Assigning Admin Role)
    setUsers(prevUsers => {
      const email = updatedClubData.adminEmail!.toLowerCase();
      const existingUserIndex = prevUsers.findIndex(u => u.email.toLowerCase() === email);
      
      let nextUsers = [...prevUsers];
      if (existingUserIndex !== -1) {
        nextUsers[existingUserIndex] = {
          ...nextUsers[existingUserIndex],
          role: 'Club Admin',
          joinedClubs: Array.from(new Set([...nextUsers[existingUserIndex].joinedClubs, clubId]))
        };
      } else {
        nextUsers.push({
          email: email,
          name: updatedClubData.president,
          role: 'Club Admin',
          department: updatedClubData.department,
          joinedClubs: [clubId]
        });
      }
      return nextUsers;
    });

    setIsClubModalOpen(false);
    alert(`Club ${editingClub ? 'updated' : 'added'} successfully.`);
  };

  const handleDeleteClub = (clubId: string) => {
    if (window.confirm("Are you sure you want to delete this club?")) {
      setClubs(clubs.filter(c => c.id !== clubId));
      setUsers(prev => prev.map(user => ({
        ...user,
        joinedClubs: user.joinedClubs.filter(id => id !== clubId)
      })));
    }
  };

  const renderAnalytics = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-[#0ea5e9]">
            <GraduationCap size={20} />
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Students</p>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{stats.students}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
            <Check size={20} />
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Faculty</p>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{stats.faculty}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
            <Briefcase size={20} />
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Admins</p>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{stats.clubAdmins}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-[#0ea5e9]" />
            Club Membership Distribution
          </h3>
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 font-bold uppercase">Real-time</span>
        </div>
        
        <div className="space-y-5">
          {clubMemberships.length > 0 ? (
            clubMemberships.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 max-w-[80%]">
                    <img src={item.logo} className="w-6 h-6 rounded-full object-cover border border-gray-100" alt="" />
                    <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-gray-400" />
                    <span className="font-black text-[#0ea5e9] dark:text-blue-400 text-sm">{item.count}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#0ea5e9] to-sky-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                    style={{ width: `${Math.min(100, (item.count / Math.max(1, users.length)) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 italic text-sm">
              No club data available for analytics.
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
           <div className="flex justify-between items-center text-xs text-gray-400">
              <p>Total Registered Users: <span className="font-bold text-gray-900 dark:text-white">{users.length}</span></p>
              <p>Total Active Clubs: <span className="font-bold text-gray-900 dark:text-white">{clubs.length}</span></p>
           </div>
        </div>
      </div>
    </div>
  );

  const renderClubsManager = () => (
    <div className="space-y-4 animate-fade-in">
        <Button onClick={() => handleOpenClubModal()} fullWidth className="flex items-center justify-center gap-2"><Plus size={18} /> Add New Club</Button>
        <div className="space-y-3 pb-20">
            {clubs.map(club => (
                <div key={club.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 group">
                     <img src={club.logoUrl} className="w-12 h-12 rounded-full bg-gray-100 object-cover" alt="logo" />
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{club.name}</h4>
                        <p className="text-xs text-gray-500">{club.category} • {club.president}</p>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => handleOpenClubModal(club)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteClub(club.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18} /></button>
                     </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderUsersManager = () => {
    const clubAdmins = users.filter(u => u.role === 'Club Admin');
    return (
      <div className="space-y-4 animate-fade-in pb-20">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={20} className="text-[#0ea5e9]" />
          Club Administrators ({clubAdmins.length})
        </h3>
        {clubAdmins.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Users className="mx-auto mb-2 opacity-20" size={48} />
            <p>No club admins found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clubAdmins.map(admin => {
              const managedClub = clubs.find(c => admin.joinedClubs.includes(c.id));
              return (
                <div key={admin.email} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{admin.name}</h4>
                      <p className="text-xs text-[#0ea5e9] font-medium">{admin.email}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase">{admin.department}</p>
                    </div>
                    {managedClub && (
                      <div className="text-right">
                        <span className="text-[10px] bg-sky-50 dark:bg-sky-900/30 text-[#0ea5e9] px-2 py-0.5 rounded-full font-bold">
                          {managedClub.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (managedClub) {
                          setActiveTab('clubs');
                          handleOpenClubModal(managedClub);
                        } else {
                          alert("This admin is not currently assigned to a club.");
                        }
                      }}
                      className="flex-1 bg-gray-50 dark:bg-gray-700 text-[#0ea5e9] dark:text-blue-400 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-sky-50 transition-colors"
                    >
                      <Edit2 size={14} /> Update Assigned Club
                    </button>
                    <button 
                      onClick={() => window.location.href = `mailto:${admin.email}`}
                      className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 rounded-lg hover:text-gray-900"
                    >
                      <Mail size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSupportDesk = () => (
    <div className="space-y-4 animate-fade-in pb-20">
      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <MessageSquare size={20} className="text-[#0ea5e9]" />
        Support Messages ({supportRequests.filter(r => r.status === 'pending').length})
      </h3>
      {supportRequests.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Mail className="mx-auto mb-2 opacity-20" size={48} />
          <p>No support messages received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {supportRequests.map(req => (
            <div key={req.id} className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border ${req.status === 'resolved' ? 'border-gray-200 opacity-60' : 'border-[#0ea5e9]/30 shadow-sm'} transition-all`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                      {req.subject}
                    </h4>
                    {req.status === 'resolved' && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Resolved</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{req.name}</p>
                    <p className="text-[11px] text-[#0ea5e9] font-medium">{req.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
                    <Clock size={10} /> {new Date(req.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed italic">
                  "{req.message}"
                </p>
              </div>
              {req.status === 'pending' ? (
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleResolveSupport(req.id)}
                    className="flex-1 bg-[#0ea5e9] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Check size={14} /> Resolve Ticket
                  </button>
                  <button 
                    onClick={() => window.location.href = `mailto:${req.email}?subject=Re: ${req.subject}`}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Send size={14} /> Reply to Student
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleDeleteSupport(req.id)}
                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Trash2 size={14} /> Delete Message
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-30">
         <div className="flex items-center gap-3"><button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><ArrowLeft size={24} /></button><h1 className="text-lg font-bold text-[#0ea5e9] dark:text-white flex items-center gap-2"><Briefcase size={20} /> Super Admin</h1></div>
      </div>
      <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-gray-800 border-b border-gray-200 sticky top-[65px] z-20">
        {(['analytics', 'clubs', 'users', 'support'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-[#0ea5e9] text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>{tab}</button>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
         {activeTab === 'clubs' && renderClubsManager()}
         {activeTab === 'analytics' && renderAnalytics()}
         {activeTab === 'users' && renderUsersManager()}
         {activeTab === 'support' && renderSupportDesk()}
      </div>

      {isClubModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                   <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingClub ? 'Edit Club' : 'Add New Club'}</h2><button onClick={() => setIsClubModalOpen(false)} className="text-gray-400"><X size={24} /></button></div>
                   <div className="space-y-4">
                       <Input label="Club Name" value={clubFormData.name} onChange={e => setClubFormData({...clubFormData, name: e.target.value})} />
                       <div className="grid grid-cols-2 gap-4">
                           <Input label="Club Admin" value={clubFormData.president} onChange={e => setClubFormData({...clubFormData, president: e.target.value})} />
                           <Input label="Club Admin Email" placeholder="admin@vit.edu" value={clubFormData.adminEmail || ''} onChange={e => setClubFormData({...clubFormData, adminEmail: e.target.value})} />
                       </div>
                       <Input label="Access Password" type="password" placeholder="Create admin password (demo: 1234)" value={clubFormData.password || ''} onChange={e => setClubFormData({...clubFormData, password: e.target.value})} />
                       
                       <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                           <select 
                               className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                               value={branches.includes(clubFormData.department || '') ? (clubFormData.department || branches[0]) : 'Other'} 
                               onChange={e => {
                                   const val = e.target.value;
                                   setClubFormData({...clubFormData, department: val});
                               }}
                           >
                               {branches.map(branch => (
                                   <option key={branch} value={branch}>{branch}</option>
                               ))}
                               <option value="Other">Other</option>
                           </select>
                       </div>
                       {((clubFormData.department && !branches.includes(clubFormData.department)) || clubFormData.department === 'Other') && (
                           <div className="animate-fade-in">
                               <Input 
                                   label="Specify Branch Name" 
                                   placeholder="e.g. Physics Department" 
                                   value={clubFormData.department === 'Other' ? '' : clubFormData.department} 
                                   onChange={e => setClubFormData({...clubFormData, department: e.target.value})} 
                               />
                           </div>
                       )}
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Logo <span className="text-red-500 font-bold text-[10px] ml-1">(Limit: 200 KB)</span></label>
                           <input type="file" accept="image/*" className="hidden" id="sa-logo" onChange={e => handleClubFileChange(e, 'logo')} />
                           <label htmlFor="sa-logo" className="flex items-center justify-center gap-2 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-sm"><Upload size={16}/> {clubFormData.logoUrl ? 'Change Logo' : 'Upload Logo'}</label>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Banner <span className="text-red-500 font-bold text-[10px] ml-1">(Limit: 1 MB)</span></label>
                           <input type="file" accept="image/*" className="hidden" id="sa-banner" onChange={e => handleClubFileChange(e, 'banner')} />
                           <label htmlFor="sa-banner" className="flex items-center justify-center gap-2 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-sm"><Upload size={16}/> {clubFormData.logoUrl ? 'Change Banner' : 'Upload Banner'}</label>
                       </div>
                       <Button onClick={handleSaveClub} fullWidth>Save Club</Button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};
