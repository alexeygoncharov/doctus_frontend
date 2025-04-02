import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  description, 
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default SectionHeader; 