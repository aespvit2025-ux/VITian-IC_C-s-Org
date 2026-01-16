
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ArrowLeft, Save, User as UserIcon, Camera, Upload } from 'lucide-react';

interface EditProfileProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onBack: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave, onBack }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    prn: user.prn || '',
    rollNo: user.rollNo || '',
    department: user.department || 'Computer Engineering',
    division: user.division || 'A',
    profilePicture: user.profilePicture || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const divisions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert("Profile photo is too large! Please keep it under 200 KB for best performance.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col animate-fade-in">
      <div className="bg-[#0ea5e9] dark:bg-gray-800 p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 text-white">
          <button onClick={onBack} className="hover:bg-white/10 p-1 rounded-full transition-colors"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-bold">Edit Profile</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center mb-8">
            <div 
              className="w-28 h-28 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center text-[#0ea5e9] dark:text-sky-200 border-4 border-white dark:border-gray-700 shadow-sm relative group cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.profilePicture ? <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={56} />}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24} /></div>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 text-xs font-bold text-[#0ea5e9] dark:text-sky-400 flex flex-col items-center gap-1 bg-sky-50 dark:bg-sky-900/30 px-4 py-2 rounded-xl">
              <span className="flex items-center gap-1.5"><Upload size={14} /> Upload Photo</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" placeholder="Enter your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="PRN no. (10 digits)" placeholder="e.g. 1211000001" maxLength={10} value={formData.prn} onChange={(e) => setFormData({ ...formData, prn: e.target.value.replace(/\D/g, '') })} required />
            <Input label="Roll no. (7 digits)" placeholder="e.g. 2101001" maxLength={7} value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value.replace(/\D/g, '') })} required />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Division</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" 
                value={formData.division} 
                onChange={(e) => setFormData({ ...formData, division: e.target.value })} 
                required
              >
                {divisions.map((div) => <option key={div} value={div}>{div}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" 
                value={branches.includes(formData.department) ? formData.department : 'Other'} 
                onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                required
              >
                {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            {(formData.department === 'Other' || !branches.includes(formData.department)) && (
              <div className="animate-fade-in">
                <Input 
                  label="Specify Branch Name" 
                  placeholder="e.g. Physics Department" 
                  value={formData.department === 'Other' ? '' : formData.department} 
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                  required 
                />
              </div>
            )}
            <div className="pt-4"><Button type="submit" fullWidth className="flex items-center justify-center gap-2"><Save size={18} /> Save Changes</Button></div>
          </form>
        </div>
      </div>
    </div>
  );
};
