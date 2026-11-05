import React from 'react';
import { Globe, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';

export const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.33 6.33 0 0 0 6.33-6.32V8.9a8.28 8.28 0 0 0 4.84 1.56V7.02a4.85 4.85 0 0 1-.92-.33Z" />
  </svg>
);

export interface SocialLinkItem {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  colorHover: string;
  badgeBg: string;
  badgeText: string;
}

export const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: 'site',
    name: 'Site Oficial',
    url: 'https://www.metarh.com.br',
    icon: <Globe size={16} />,
    colorHover: 'hover:text-metarh-lime hover:border-metarh-lime',
    badgeBg: 'bg-white/10 hover:bg-metarh-lime hover:text-metarh-dark',
    badgeText: 'text-white'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/metarhconsultoria',
    icon: <Linkedin size={16} />,
    colorHover: 'hover:text-[#0A66C2] hover:border-[#0A66C2]',
    badgeBg: 'bg-white/10 hover:bg-[#0A66C2] hover:text-white',
    badgeText: 'text-white'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/metarhconsultoria',
    icon: <Instagram size={16} />,
    colorHover: 'hover:text-[#E4405F] hover:border-[#E4405F]',
    badgeBg: 'bg-white/10 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white',
    badgeText: 'text-white'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    url: 'https://www.tiktok.com/@metarhconsultoria',
    icon: <TikTokIcon size={16} />,
    colorHover: 'hover:text-[#25F4EE] hover:border-[#25F4EE]',
    badgeBg: 'bg-white/10 hover:bg-black hover:text-[#25F4EE]',
    badgeText: 'text-white'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com/metarhconsultoria',
    icon: <Facebook size={16} />,
    colorHover: 'hover:text-[#1877F2] hover:border-[#1877F2]',
    badgeBg: 'bg-white/10 hover:bg-[#1877F2] hover:text-white',
    badgeText: 'text-white'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@metarhconsultoria',
    icon: <Youtube size={16} />,
    colorHover: 'hover:text-[#FF0000] hover:border-[#FF0000]',
    badgeBg: 'bg-white/10 hover:bg-[#FF0000] hover:text-white',
    badgeText: 'text-white'
  }
];

interface SocialLinksProps {
  variant?: 'hero' | 'header' | 'footer';
  className?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ variant = 'hero', className = '' }) => {
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${item.name} METARH`}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-metarh-lime flex items-center justify-center transition-all cursor-pointer"
          >
            {item.icon}
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs font-medium transition-all border border-white/5 hover:border-white/20"
          >
            {item.icon}
            <span>{item.name}</span>
          </a>
        ))}
      </div>
    );
  }

  // Default: Hero variant (compact interactive pills with labels and icons)
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-xs font-semibold text-purple-200 mr-1 flex items-center gap-1">
        Redes & Site:
      </span>
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-xs cursor-pointer border border-white/15 ${item.badgeBg}`}
        >
          {item.icon}
          <span className="text-[11px]">{item.name}</span>
        </a>
      ))}
    </div>
  );
};
