import React from 'react';

interface BadgeProps {
  text?: string;
}

export const HealthyBadge = ({ text }: BadgeProps) => (
  <div className="font-medium py-1 px-4 rounded-full bg-green-light text-green-dark text-sm">
    {text || 'Connected'}
  </div>
);

export const UnhealthyBadge = ({ text }: BadgeProps) => (
  <div className="font-medium py-1 px-4 rounded-full bg-red-light text-red-dark text-sm">
    {text || 'Disabled'}
  </div>
);

export const InfoBadge = ({ text }: BadgeProps) => (
  <div className="font-medium py-1 px-4 rounded-full bg-warning-yellow-light text-warning-yellow-dark text-sm">
    {text || 'Disabled'}
  </div>
);
