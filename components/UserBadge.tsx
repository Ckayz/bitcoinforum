import { Crown, Shield, User, CheckCircle } from 'lucide-react';

interface UserBadgeProps {
  role?: string;
  username: string;
  className?: string;
}

export function UserBadge({ role = 'user', username, className = '' }: UserBadgeProps) {
  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />;
      case 'verified':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return 'text-yellow-500';
      case 'moderator':
        return 'text-blue-500';
      case 'verified':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {getRoleIcon()}
      <span className={getRoleColor()}>{username}</span>
      {role !== 'user' && (
        <span className={`text-xs px-1 py-0.5 rounded ${
          role === 'admin' 
            ? 'bg-yellow-500/20 text-yellow-400'
            : role === 'moderator'
            ? 'bg-blue-500/20 text-blue-400' 
            : role === 'verified'
            ? 'bg-green-500/20 text-green-400'
            : ''
        }`}>
          {role}
        </span>
      )}
    </div>
  );
}
