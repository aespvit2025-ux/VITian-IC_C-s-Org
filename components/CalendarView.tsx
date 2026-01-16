import React, { useState } from 'react';
import { ClubEvent } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  events: ClubEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  
  // Pad the start of the month
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === day && 
               d.getMonth() === currentMonth.getMonth() && 
               d.getFullYear() === currentMonth.getFullYear();
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 animate-fade-in">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0ea5e9] dark:text-white">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-xs font-bold text-gray-400 py-2">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square"></div>
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const hasEvent = dayEvents.length > 0;
          const isSelected = 
             selectedDate.getDate() === day && 
             selectedDate.getMonth() === currentMonth.getMonth() && 
             selectedDate.getFullYear() === currentMonth.getFullYear();
          const isToday = 
             new Date().getDate() === day && 
             new Date().getMonth() === currentMonth.getMonth() && 
             new Date().getFullYear() === currentMonth.getFullYear();

          return (
            <div 
              key={day} 
              onClick={() => onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              className={`
                aspect-square rounded-full flex flex-col items-center justify-center text-sm font-medium cursor-pointer relative transition-all
                ${isSelected 
                    ? 'bg-[#0ea5e9] text-white shadow-md' 
                    : isToday 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0ea5e9] dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
            >
              <span>{day}</span>
              {hasEvent && (
                <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-red-500'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};