import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value + 'T12:00:00') : new Date());
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calendar generation
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = endOfMonth.getDate();
    
    // Format Display Date: YYYY-MM-DD -> Oct 24, 2026
    const displayDate = value 
        ? new Date(value + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Select Date';

    const handleSelectDate = (day: number) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, '0');
        const dd = String(selected.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={popoverRef}>
             <button 
                 onClick={() => setIsOpen(!isOpen)}
                 className={`w-full flex items-center justify-between bg-[#1A241E] hover:bg-[#1f2b24] text-white rounded-2xl px-5 py-4 outline-none transition-all cursor-pointer ${isOpen ? 'ring-2 ring-primary/50 border-primary/50' : 'border border-white/5'} font-medium tracking-wide`}
             >
                 <div className="flex items-center gap-3">
                     <CalendarIcon className={`w-5 h-5 ${isOpen || value ? 'text-primary' : 'text-white/50'} transition-colors`} />
                     <span className={value ? 'text-white' : 'text-white/50'}>{displayDate}</span>
                 </div>
             </button>

             {isOpen && (
                 <div className="absolute bottom-full left-0 mb-3 w-full sm:w-[320px] bg-[#0A120E]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 origin-bottom duration-200">
                     <div className="flex items-center justify-between mb-6">
                         <h3 className="text-white font-bold tracking-wide flex-1 text-center">
                             {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                         </h3>
                         <div className="flex gap-2 absolute right-5">
                             <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                             <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                         </div>
                     </div>
                     <div className="grid grid-cols-7 gap-2 mb-2">
                         {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                             <div key={day} className="text-center text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">{day}</div>
                         ))}
                         {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                         {Array.from({ length: daysInMonth }).map((_, i) => {
                             const dateNum = i + 1;
                             const thisDateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                             const isSelected = value === thisDateStr;
                             const isToday = new Date().toLocaleDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateNum).toLocaleDateString();
                             return (
                                 <button 
                                     key={dateNum}
                                     onClick={() => handleSelectDate(dateNum)}
                                     className={`aspect-square w-full rounded-xl flex items-center justify-center text-sm font-semibold transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                                         isSelected 
                                            ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                                            : isToday 
                                                ? 'bg-[#1f2b24] text-primary border border-primary/20'
                                                : 'text-white/90 hover:bg-white/10'
                                     }`}
                                 >
                                     {dateNum}
                                 </button>
                             )
                         })}
                     </div>
                 </div>
             )}
        </div>
    );
};

export default CustomDatePicker;
