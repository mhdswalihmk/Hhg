import React from 'react';

// Use the generated image path as a string to satisfy tsc compilation
const logoJpg = '/src/assets/images/hidayakkar_logo_1783302221985.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onDoubleClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', onDoubleClick }) => {
  let sizeClasses = 'w-12 h-12';
  if (size === 'sm') sizeClasses = 'w-8 h-8';
  if (size === 'lg') sizeClasses = 'w-24 h-24';
  if (size === 'xl') sizeClasses = 'w-36 h-36';

  return (
    <div 
      onDoubleClick={onDoubleClick}
      className={`relative flex items-center justify-center rounded-full bg-brand-charcoal p-0.5 border border-brand-gold/40 glow-gold cursor-pointer ${sizeClasses} ${className}`}
    >
      {/* Primary: The generated cool Arab sunglasses man image */}
      <img
        src={logoJpg}
        alt="Hidayakkar Logo"
        className="w-full h-full object-cover rounded-full"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // If the image fails to load, render the custom vector SVG fallback
          e.currentTarget.style.display = 'none';
          const sibling = e.currentTarget.nextElementSibling;
          if (sibling) {
            (sibling as HTMLElement).style.display = 'block';
          }
        }}
      />

      {/* SVG Fallback: An Arabic style cooling glass weared man vector */}
      <svg
        className="w-full h-full text-brand-gold hidden p-1"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="48" fill="#121212" stroke="#D4AF37" strokeWidth="2" />
        
        {/* Arabic Headwear: Ghutra / Keffiyeh outline */}
        <path
          d="M20,38 Q35,15 50,15 Q65,15 80,38 L78,55 L75,70 Q70,85 50,85 Q30,85 25,70 L22,55 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.5"
        />
        
        {/* Agal (black cord holding headwear) */}
        <ellipse cx="50" cy="24" rx="26" ry="4" fill="#000000" />
        <ellipse cx="50" cy="27" rx="25" ry="3.5" fill="#1A1A1A" />
        
        {/* Man's face base */}
        <path
          d="M32,45 C32,40 68,40 68,45 C68,55 65,72 50,72 C35,72 32,55 32,45 Z"
          fill="#F5E6CA" // Sand beige skin tone
        />
        
        {/* Traditional Arabian Beard/Goatee details */}
        <path
          d="M32,54 C35,68 45,74 50,74 C55,74 65,68 68,54 C68,58 66,74 50,75 C34,74 32,58 32,54 Z"
          fill="#111111"
        />
        <path
          d="M42,57 L58,57 L50,68 Z"
          fill="#111111"
        />
        {/* Moustache */}
        <path
          d="M37,52 Q50,49 50,53 Q50,49 63,52 Q50,55 50,52 Z"
          fill="#111111"
        />

        {/* The Cooling Glasses (Black stylish sunglasses with gold bridge) */}
        <g id="sunglasses">
          {/* Left Lens */}
          <path
            d="M26,45 C26,40 43,40 44,45 C44,50 32,52 28,49 C26,48 26,46 26,45 Z"
            fill="#121212"
            stroke="#D4AF37"
            strokeWidth="1.5"
          />
          {/* Right Lens */}
          <path
            d="M56,45 C56,40 73,40 74,45 C74,50 62,52 58,49 C56,48 56,46 56,45 Z"
            fill="#121212"
            stroke="#D4AF37"
            strokeWidth="1.5"
          />
          {/* Bridge */}
          <rect x="43" y="42" width="14" height="2.5" fill="#D4AF37" />
          
          {/* Lens reflection/glare */}
          <path d="M29,43 L33,41" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          <path d="M59,43 L63,41" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
