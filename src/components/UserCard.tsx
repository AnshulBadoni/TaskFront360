import Image from 'next/image'


interface User {
  id: string
  username: string
  avatar?: string
  role: string
  status?: 'active' | 'inactive'
}

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="group min-w-64 lg:min-w-96 relative rounded-xl p-4 flex items-center space-x-4 transition-all duration-300 hover:-translate-y-1 border border-gray-200 overflow-hidden">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

      {/* Avatar with subtle border gradient */}
      <div className="relative h-14 w-14 flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 p-0.5">
          <div className="relative h-full w-full rounded-full bg-white overflow-hidden">
            <img
              src={user.avatar || '/user.png'}
              alt="user"
              className="size-full object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      {/* User info with subtle animations */}
      <div className="relative z-10">
        <h3 className="font-semibold text-gray-900 tracking-tight transition-all duration-300 group-hover:text-blue-600 capitalize">
          {user.username}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5 transition-all duration-300 group-hover:text-gray-700">
          {user.role}
        </p>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  )
}
