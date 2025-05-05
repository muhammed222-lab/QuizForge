import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  min?: number;
  max?: number;
  step?: number;
  animate?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    className, 
    label, 
    showValue = true, 
    valuePrefix = '', 
    valueSuffix = '', 
    min = 0, 
    max = 100, 
    step = 1, 
    animate = true,
    ...props 
  }, ref) => {
    const [value, setValue] = React.useState<number>(props.value ? Number(props.value) : min);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputId = props.id || `slider-${Math.random().toString(36).substring(2, 9)}`;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setValue(newValue);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const percentage = ((value as number - min) / (max - min)) * 100;
    
    React.useEffect(() => {
      if (props.value !== undefined) {
        setValue(Number(props.value));
      }
    }, [props.value]);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-gray-700"
            >
              {label}
            </label>
          )}
          {showValue && (
            <motion.span 
              className="text-sm font-medium text-gray-700"
              animate={{ scale: isDragging ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            >
              {valuePrefix}{value}{valueSuffix}
            </motion.span>
          )}
        </div>
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full">
            <motion.div 
              className="absolute h-2 bg-primary-500 rounded-full"
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <input
            id={inputId}
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className={cn(
              'absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent',
              className
            )}
            style={{
              // Custom thumb styles
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
            {...props}
          />
          <style jsx>{`
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #6366f1;
              cursor: pointer;
              transition: all 0.15s ease-in-out;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            input[type=range]::-webkit-slider-thumb:hover {
              transform: scale(1.1);
              box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
            }
            
            input[type=range]::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #6366f1;
              cursor: pointer;
              border: none;
              transition: all 0.15s ease-in-out;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            input[type=range]::-moz-range-thumb:hover {
              transform: scale(1.1);
              box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
            }
          `}</style>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
