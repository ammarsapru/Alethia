import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    // make Card a flex column so its body can grow/shrink to fit children
    <div className={`bg-card-bg border border-card-border rounded-lg shadow-md flex flex-col ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary p-4 border-b border-card-border">
        {title}
      </h3>
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
};

export default Card;
