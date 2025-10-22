'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Card className={`bg-zinc-900 border-zinc-800 ${className}`}>
      <CardContent className="p-8 text-center">
        <Icon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
