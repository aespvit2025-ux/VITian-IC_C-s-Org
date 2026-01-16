import React from 'react';
import { ArrowLeft, Globe, MapPin, Award } from 'lucide-react';
import { Button } from './Button';

interface AboutVITProps {
  onBack: () => void;
}

export const AboutVIT: React.FC<AboutVITProps> = ({ onBack }) => {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      <div className="bg-[#0ea5e9] dark:bg-gray-800 p-4 sticky top-0 z-30 shadow-md">
         <div className="flex items-center gap-3 text-white">
             <button onClick={onBack} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                 <ArrowLeft size={24} />
             </button>
             <h1 className="text-lg font-bold">About VIT Pune</h1>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative h-56">
           <img 
             src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop" 
             alt="VIT Pune Campus" 
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                 <h2 className="text-3xl font-bold text-white mb-1">Vishwakarma Institute of Technology</h2>
                 <p className="text-white/80 flex items-center gap-1 text-sm"><MapPin size={14} /> Bibwewadi, Pune</p>
              </div>
           </div>
        </div>

        <div className="p-6 space-y-8 pb-10">
           <section>
              <div className="flex items-center gap-2 mb-3">
                 <Award className="text-[#0ea5e9] dark:text-blue-400" size={24} />
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Our Heritage</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm text-justify">
                Vishwakarma Institute of Technology, Pune, a highly commended private institute, occupies a place of pride amongst the premier technical institutes of the western region of India. Established in 1983, financed and run by the Bansilal Ramnath Agarwal Charitable Trust, Pune. It is affiliated to the University of Pune.
              </p>
           </section>

           <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Vision & Mission</h3>
              <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border-l-4 border-[#0ea5e9] dark:border-blue-500 mb-4">
                 <h4 className="font-bold text-[#0ea5e9] dark:text-blue-300 text-sm mb-1">Vision</h4>
                 <p className="text-gray-700 dark:text-gray-300 text-sm italic">"To be globally acclaimed Institute in Technical Education and Research for holistic socio-economic development."</p>
              </div>
              <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border-l-4 border-blue-400">
                 <h4 className="font-bold text-[#0ea5e9] dark:text-blue-300 text-sm mb-1">Mission</h4>
                 <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1">
                    <li>Ensure that 100% students are employable in Industry, Higher studies, Entrepreneurship, Civil/Defense Services.</li>
                    <li>Strengthen Academic Practices.</li>
                    <li>Promote Research Culture.</li>
                 </ul>
              </div>
           </section>

           <section>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Links</h3>
               <Button 
                 onClick={() => window.open('https://www.vit.edu', '_blank')} 
                 variant="outline" 
                 fullWidth 
                 className="flex items-center justify-center gap-2"
                >
                   <Globe size={18} /> Visit Official Website
               </Button>
           </section>
           
           <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400">© 2024 Vishwakarma Institute of Technology</p>
           </div>
        </div>
      </div>
    </div>
  );
};