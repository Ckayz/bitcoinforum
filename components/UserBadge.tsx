import { Crown, Shield, User, CheckCircle } from 'lucide-react';

interface UserBadgeProps {
  role?: string;
  username: string;
  className?: string;
  isAnonymous?: boolean;
}

export function UserBadge({ role = 'user', username, className = '', isAnonymous = false }: UserBadgeProps) {
  const displayName = isAnonymous ? 'Anonymous' : username;
  const displayRole = isAnonymous ? 'user' : role;
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
    switch (displayRole) {
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
      <span className={getRoleColor()}>{displayName}</span>
      {displayRole !== 'user' && !isAnonymous && (
        <span className={`text-xs px-1 py-0.5 rounded ${
          displayRole === 'admin' 
            ? 'bg-yellow-500/20 text-yellow-400'
            : displayRole === 'moderator'
            ? 'bg-blue-500/20 text-blue-400' 
            : displayRole === 'verified'
            ? 'bg-green-500/20 text-green-400'
            : ''
        }`}>
          {displayRole}
        </span>
      )}
    </div>
  );
}
