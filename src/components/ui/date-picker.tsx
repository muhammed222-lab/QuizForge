import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './input';
import { Button } from './button';

export interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  showTimeSelect?: boolean;
  animate?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  className,
  error,
  minDate,
  maxDate,
  disabled = false,
  showTimeSelect = false,
  animate = true,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value?.getMonth() || new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(value?.getFullYear() || new Date().getFullYear());
  const [hours, setHours] = React.useState(value?.getHours() || 12);
  const [minutes, setMinutes] = React.useState(value?.getMinutes() || 0);
  const [ampm, setAmpm] = React.useState(value?.getHours() ? (value.getHours() >= 12 ? 'PM' : 'AM') : 'AM');
  
  const datePickerRef = React.useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    
    if (showTimeSelect) {
      const hours12 = date.getHours() % 12 || 12;
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      return `${formattedDate} ${hours12}:${minutes} ${ampm}`;
    }
    
    return formattedDate;
  };

  // Get days in month
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    
    if (showTimeSelect) {
      const hoursValue = ampm === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
      newDate.setHours(hoursValue, minutes);
    }
    
    setSelectedDate(newDate);
    if (onChange) onChange(newDate);
    setIsOpen(false);
  };

  // Handle time change
  const handleTimeChange = () => {
    if (!selectedDate) return;
    
    const hoursValue = ampm === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
    const newDate = new Date(selectedDate);
    newDate.setHours(hoursValue, minutes);
    
    setSelectedDate(newDate);
    if (onChange) onChange(newDate);
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Check if date is selectable
  const isDateSelectable = (day: number): boolean => {
    const date = new Date(currentYear, currentMonth, day);
    
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    
    return true;
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value.getMonth());
      setCurrentYear(value.getFullYear());
      
      if (showTimeSelect) {
        const hours12 = value.getHours() % 12 || 12;
        setHours(hours12);
        setMinutes(value.getMinutes());
        setAmpm(value.getHours() >= 12 ? 'PM' : 'AM');
      }
    }
  }, [value, showTimeSelect]);

  // Render calendar days
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear;
      
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === currentMonth && 
        new Date().getFullYear() === currentYear;
      
      const selectable = isDateSelectable(day);

      days.push(
        <motion.button
          key={day}
          type="button"
          whileHover={selectable ? { scale: 1.1 } : {}}
          whileTap={selectable ? { scale: 0.95 } : {}}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm',
            isSelected && 'bg-primary-600 text-white',
            !isSelected && isToday && 'border border-primary-500 text-primary-700',
            !isSelected && !isToday && selectable && 'hover:bg-primary-100',
            !selectable && 'cursor-not-allowed opacity-40',
          )}
          onClick={() => selectable && handleDateSelect(day)}
          disabled={!selectable}
        >
          {day}
        </motion.button>
      );
    }

    return days;
  };

  return (
    <div className={cn('relative', className)} ref={datePickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Input
        value={formatDate(selectedDate)}
        placeholder={placeholder}
        onClick={() => !disabled && setIsOpen(true)}
        readOnly
        className={cn(error && 'border-red-500')}
        error={error}
        disabled={disabled}
      />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-72 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5"
          >
            {/* Calendar header */}
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="h-8 w-8 p-0"
                aria-label="Previous month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
              <div className="text-center text-sm font-medium">
                {MONTHS[currentMonth]} {currentYear}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="h-8 w-8 p-0"
                aria-label="Next month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            
            {/* Day names */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderDays()}
            </div>
            
            {/* Time selector */}
            {showTimeSelect && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <select
                      value={hours}
                      onChange={(e) => {
                        setHours(parseInt(e.target.value));
                        setTimeout(handleTimeChange, 0);
                      }}
                      className="rounded-md border border-gray-300 p-1 text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>
                          {h.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span>:</span>
                    <select
                      value={minutes}
                      onChange={(e) => {
                        setMinutes(parseInt(e.target.value));
                        setTimeout(handleTimeChange, 0);
                      }}
                      className="rounded-md border border-gray-300 p-1 text-sm"
                    >
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <option key={m} value={m}>
                          {m.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ampm}
                      onChange={(e) => {
                        setAmpm(e.target.value);
                        setTimeout(handleTimeChange, 0);
                      }}
                      className="rounded-md border border-gray-300 p-1 text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (selectedDate) {
                    handleTimeChange();
                    setIsOpen(false);
                  }
                }}
                disabled={!selectedDate}
              >
                Apply
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { DatePicker };
