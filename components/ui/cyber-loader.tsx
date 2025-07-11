'use client';

import { cn } from '@/lib/utils';

interface CyberLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CyberLoader({ size = 'medium', className }: CyberLoaderProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Main Loader */}
      <div className="relative">
        {/* Outer Ring */}
        <div className={cn(
          'border-2 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full animate-spin',
          sizeClasses[size]
        )} />
        
        {/* Inner Ring */}
        <div className={cn(
          'absolute inset-2 border-2 border-transparent border-b-cyan-400 border-l-purple-400 rounded-full animate-spin',
          'animation-direction: reverse'
        )} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        
        {/* Center Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        </div>
        
        {/* Glow Effect */}
        <div className={cn(
          'absolute inset-0 rounded-full opacity-30 animate-pulse',
          'bg-gradient-to-r from-cyan-400 to-purple-400 blur-sm'
        )} />
      </div>
      
      {/* Loading Text */}
      <div className="text-center">
        <div className="text-cyan-400 font-mono text-sm animate-pulse">
          ACCESSING NEURAL NETWORK...
        </div>
        <div className="flex justify-center gap-1 mt-2">
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}