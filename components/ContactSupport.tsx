import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { FAQS } from '../constants';
import { SupportRequest, User } from '../types';

interface ContactSupportProps {
  onBack: () => void;
  onSubmitSupport?: (request: Omit<SupportRequest, 'id' | 'timestamp' | 'status'>) => void;
  user?: User | null;
}

export const ContactSupport: React.FC<ContactSupportProps> = ({ onBack, onSubmitSupport, user }) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'faq'>('contact');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    subject: '', 
    message: '' 
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Update form if user data loads or changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitSupport) {
      onSubmitSupport(formData);
    }
    // Mock submission UI state
    setTimeout(() => setIsSubmitted(true), 1000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <div className="bg-[#0ea5e9] dark:bg-gray-800 p-4 sticky top-0 z-30 shadow-md">
         <div className="flex items-center gap-3 text-white mb-4">
             <button onClick={onBack} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                 <ArrowLeft size={24} />
             </button>
             <h1 className="text-lg font-bold">Help & Support</h1>
         </div>
         <div className="flex p-1 bg-black/20 rounded-xl backdrop-blur-sm">
            <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                    activeTab === 'contact' ? 'bg-white text-[#0ea5e9] shadow-sm' : 'text-white/70 hover:bg-white/10'
                }`}
            >
                Contact Us
            </button>
            <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                    activeTab === 'faq' ? 'bg-white text-[#0ea5e9] shadow-sm' : 'text-white/70 hover:bg-white/10'
                }`}
            >
                FAQs
            </button>
         </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'contact' && (
            <div className="max-w-md mx-auto animate-fade-in">
                {isSubmitted ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700 mt-10">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Thank you for contacting us. Your request has been sent to the administration. We will get back to you shortly.</p>
                        <Button onClick={() => { setIsSubmitted(false); setFormData({...formData, subject: '', message: ''}); }} variant="outline">
                            Send Another
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="text-center mb-2">
                             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-[#0ea5e9] dark:text-blue-400">
                                <MessageSquare size={24} />
                             </div>
                             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Get in Touch</h2>
                             <p className="text-xs text-gray-500 dark:text-gray-400">We'd love to hear from you. Fill out the form below.</p>
                        </div>

                        <Input 
                            label="Your Name" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                        <Input 
                            label="Email Address" 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                           <select 
                               className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                               value={formData.subject}
                               onChange={e => setFormData({...formData, subject: e.target.value})}
                               required
                           >
                               <option value="">Select a topic</option>
                               <option value="technical">Technical Issue</option>
                               <option value="club">Club Inquiry</option>
                               <option value="feedback">Feedback/Suggestion</option>
                               <option value="other">Other</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                           <textarea 
                               className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[120px]"
                               placeholder="How can we help you?"
                               value={formData.message}
                               onChange={e => setFormData({...formData, message: e.target.value})}
                               required
                           />
                       </div>

                       <Button type="submit" fullWidth className="flex items-center justify-center gap-2">
                           <Send size={18} /> Send Message
                       </Button>
                    </form>
                )}
            </div>
        )}

        {activeTab === 'faq' && (
            <div className="space-y-3 animate-fade-in pb-10">
                {FAQS.map((faq, index) => (
                    <div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <button 
                            onClick={() => toggleFaq(index)}
                            className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">{faq.question}</span>
                            {openFaqIndex === index ? <ChevronUp size={18} className="text-[#0ea5e9] dark:text-blue-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                        </button>
                        {openFaqIndex === index && (
                            <div className="px-4 pb-4 pt-0 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-800">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};