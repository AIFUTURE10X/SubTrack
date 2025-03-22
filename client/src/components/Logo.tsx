import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  // Size mapping for the SVG logo
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const logoSize = sizeMap[size];
  const fontSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';

  return (
    <div className="flex items-center">
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chart bars with upward trend */}
        <path
          d="M22 34H13C12.4477 34 12 33.5523 12 33V25C12 24.4477 12.4477 24 13 24H22C22.5523 24 23 24.4477 23 25V33C23 33.5523 22.5523 34 22 34Z"
          fill="#22c55e" // Green color for the first bar
        />
        <path
          d="M31 34H22C21.4477 34 21 33.5523 21 33V19C21 18.4477 21.4477 18 22 18H31C31.5523 18 32 18.4477 32 19V33C32 33.5523 31.5523 34 31 34Z"
          fill="#34d399" // Light green for the middle bar
        />
        <path
          d="M40 34H31C30.4477 34 30 33.5523 30 33V10C30 9.44772 30.4477 9 31 9H40C40.5523 9 41 9.44772 41 10V33C41 33.5523 40.5523 34 40 34Z"
          fill="#10b981" // Darker green for the tallest bar
        />
        
        {/* 'S' swoosh overlay */}
        <path
          d="M32 13C28 15 24 15 20 13C16 11 12 11 8 13V20C12 18 16 18 20 20C24 22 28 22 32 20V13Z"
          fill="#3b82f6" // Blue color for the 'S' swoosh
        />
      </svg>
      
      {showText && (
        <span className={`ml-2 font-bold tracking-tight ${fontSize} text-foreground`}>
          SubTrack
        </span>
      )}
    </div>
  );
}