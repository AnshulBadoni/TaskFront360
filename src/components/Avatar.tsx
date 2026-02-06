interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy' | 'verified';
  className?: string;
}

export const Avatar = ({ src, name, size = 'md', status, className = '' }: AvatarProps) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-300',
    busy: 'bg-red-500',
    verified: 'bg-blue-500',
  };

  const initials = name.split(' ').map(part => part[0]).join('').toUpperCase();

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
          src={src}
          alt={name}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 ${className}`}>
          {initials}
        </div>
      )}

      {status && (
        <span className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800 ${statusClasses[status]
          } ${size === 'xs' ? 'h-1.5 w-1.5' :
            size === 'sm' ? 'h-2 w-2' :
              'h-2.5 w-2.5'
          }`} />
      )}
    </div>
  );
};
