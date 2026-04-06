import React, { useState, useRef, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

interface CustomTimePickerProps {
    value: string;
    onChange: (time: string) => void;
}

const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hr12 = h % 12 || 12;
            times.push({
                value: `${hh}:${mm}`,
                label: `${hr12}:${mm} ${ampm}`
            });
        }
    }
    return times;
};

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const timeOptions = generateTimeOptions();

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

    const displayTime = value 
        ? timeOptions.find(t => t.value === value)?.label || value 
        : 'Select Time';

    return (
        <div className="relative w-full" ref={popoverRef}>
             <button 
                 onClick={() => setIsOpen(!isOpen)}
                 className={`w-full flex items-center justify-between bg-[#1A241E] hover:bg-[#1f2b24] text-white rounded-2xl px-5 py-4 outline-none transition-all cursor-pointer ${isOpen ? 'ring-2 ring-primary/50 border-primary/50' : 'border border-white/5'} font-medium tracking-wide`}
             >
                 <div className="flex items-center gap-3">
                     <ClockIcon className={`w-5 h-5 ${isOpen || value ? 'text-primary' : 'text-white/50'} transition-colors`} />
                     <span className={value ? 'text-white' : 'text-white/50'}>{displayTime}</span>
                 </div>
             </button>

             {isOpen && (
                 <div className="absolute bottom-full right-0 left-0 sm:left-auto mb-3 w-full sm:w-[240px] max-h-[320px] overflow-y-auto overflow-x-hidden bg-[#0A120E]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 origin-bottom duration-200">
                     <div className="grid grid-cols-2 gap-2">
                        {timeOptions.map((time) => {
                            const isSelected = value === time.value;
                            return (
                                <button
                                    key={time.value}
                                    onClick={() => {
                                        onChange(time.value);
                                        setIsOpen(false);
                                    }}
                                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                        isSelected 
                                            ? 'bg-primary text-black shadow-md shadow-primary/20' 
                                            : 'text-white/90 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {time.label}
                                </button>
                            );
                        })}
                     </div>
                 </div>
             )}
        </div>
    );
};

export default CustomTimePicker;
