
import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: number;
}

const BrandIcon: React.FC<BrandIconProps> = ({ className = "", size = 100 }) => {
  // Balanced size for high-quality SVG rendering
  const width = size * 1.6;
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`} style={{ width: width }}>
      <svg 
        viewBox="0 0 450 280" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible drop-shadow-xl"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="boxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C026D3" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* 1. Headphones (Top) */}
        <path 
          d="M150 100C150 58.5786 183.579 25 225 25C266.421 25 300 58.5786 300 100" 
          stroke="url(#glowGrad)" 
          strokeWidth="12" 
          strokeLinecap="round"
        />
        <rect x="135" y="90" width="22" height="55" rx="11" fill="#4F46E5" />
        <rect x="293" y="90" width="22" height="55" rx="11" fill="#4F46E5" />

        {/* 2. Video Studio Box (Middle) */}
        <rect 
          x="165" y="65" width="120" height="100" rx="22" 
          fill="url(#boxGrad)" 
          stroke="white"
          strokeWidth="4"
        />
        <path d="M210 95L250 115L210 135V95Z" fill="white" />

        {/* 3. Professional Mic (Bottom) */}
        <g transform="translate(225, 190)">
          <line x1="-90" y1="0" x2="-40" y2="0" stroke="#F43F5E" strokeWidth="5" strokeLinecap="round" />
          <line x1="40" y1="0" x2="90" y2="0" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
          
          <rect x="-12" y="-20" width="24" height="32" rx="12" fill="#4F46E5" stroke="white" strokeWidth="2" />
          <path d="M-20 -5C-20 8 -12 16 0 16C12 16 20 8 20 -5" stroke="#4F46E5" strokeWidth="4" fill="none" strokeLinecap="round" />
          <line x1="0" y1="16" x2="0" y2="25" stroke="#4F46E5" strokeWidth="4" />
        </g>

        {/* 4. Brand Text - Lowered 'L' as requested */}
        <text 
          x="225" y="245" 
          textAnchor="middle" 
          fill="#1E293B" 
          style={{ font: "900 56px 'Montserrat', sans-serif", letterSpacing: "-1.5px" }}
        >
          Trans<tspan dy="7">L</tspan><tspan dy="-7">earn</tspan>
        </text>
        <text 
          x="225" y="275" 
          textAnchor="middle" 
          fill="#3B82F6" 
          style={{ font: "bold 24px 'Montserrat', sans-serif", letterSpacing: "14px", textTransform: "uppercase" }}
        >
          STUDIO
        </text>
      </svg>
    </div>
  );
};

export default BrandIcon;
