import React from 'react';

export const Logo: React.FC<{ variant?: 'white' | 'purple' }> = ({ variant = 'purple' }) => {
  // URL for dark backgrounds (white logo)
  const logoWhite = 'https://metarh.com.br/wp-content/uploads/2025/11/logo_METARH.png';
  
  // URL for light backgrounds (blue/purple logo)
  const logoBlue = 'https://metarh.com.br/wp-content/uploads/2025/11/logo-metarh-azul.png';

  const logoUrl = variant === 'white' ? logoWhite : logoBlue;
  
  return (
    <div className="flex items-center">
      <img 
        src={logoUrl} 
        alt="METARH Recursos Humanos" 
        className="h-12 w-auto object-contain"
      />
    </div>
  );
};