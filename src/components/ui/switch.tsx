import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  animate?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, animate = true, ...props }, ref) => {
    const [checked, setChecked] = React.useState<boolean>(props.checked || false);
    const inputId = props.id || `switch-${Math.random().toString(36).substring(2, 9)}`;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(e.target.checked);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    React.useEffect(() => {
      if (props.checked !== undefined) {
        setChecked(props.checked);
      }
    }, [props.checked]);

    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="checkbox"
            id={inputId}
            className="sr-only"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <motion.div
            className={cn(
              'relative h-6 w-11 cursor-pointer rounded-full transition-colors',
              checked ? 'bg-primary-600' : 'bg-gray-300',
              className
            )}
            animate={{ backgroundColor: checked ? 'rgb(79, 70, 229)' : 'rgb(209, 213, 219)' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={() => {
              if (!props.disabled) {
                setChecked(!checked);
                const event = {
                  target: { checked: !checked },
                } as React.ChangeEvent<HTMLInputElement>;
                if (props.onChange) {
                  props.onChange(event);
                }
              }
            }}
          >
            <motion.div
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                checked && 'translate-x-5'
              )}
              animate={{ x: checked ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
