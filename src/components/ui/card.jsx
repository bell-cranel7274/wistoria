import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-card text-card-foreground rounded-lg border border-border shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}; 