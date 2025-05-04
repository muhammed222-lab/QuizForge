import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular', 
    animation = 'pulse', 
    width, 
    height,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'circular':
          return 'rounded-full';
        case 'text':
          return 'h-4 w-full rounded';
        default:
          return 'rounded-md';
      }
    };

    const getAnimationClasses = () => {
      switch (animation) {
        case 'pulse':
          return 'animate-pulse';
        case 'wave':
          return 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';
        default:
          return '';
      }
    };

    const style: React.CSSProperties = {
      width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200',
          getVariantClasses(),
          getAnimationClasses(),
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
  lastLineWidth?: string | number;
  spacing?: string | number;
}

const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '70%',
  spacing = '0.5rem',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 && lastLineWidth ? lastLineWidth : undefined}
          style={{ marginBottom: index < lines - 1 ? spacing : undefined }}
          {...props}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: boolean;
  media?: boolean;
  mediaHeight?: string | number;
  lines?: number;
  footer?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  header = true,
  media = true,
  mediaHeight = '200px',
  lines = 3,
  footer = true,
  animation = 'pulse',
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm',
        className
      )}
      {...props}
    >
      {header && (
        <div className="mb-4 flex items-center space-x-4">
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation={animation}
          />
          <div className="space-y-2">
            <Skeleton
              variant="text"
              width={120}
              animation={animation}
            />
            <Skeleton
              variant="text"
              width={80}
              animation={animation}
            />
          </div>
        </div>
      )}
      
      {media && (
        <Skeleton
          className="mb-4"
          height={mediaHeight}
          animation={animation}
        />
      )}
      
      <SkeletonText
        lines={lines}
        animation={animation}
      />
      
      {footer && (
        <div className="mt-4 flex justify-between">
          <Skeleton
            width={100}
            height={36}
            animation={animation}
          />
          <Skeleton
            width={100}
            height={36}
            animation={animation}
          />
        </div>
      )}
    </div>
  );
};

export { Skeleton, SkeletonText, SkeletonCard };
