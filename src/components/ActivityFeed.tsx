interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    userAvatar?: string;
    actionIcon?: string;
}

interface ActivityFeedProps {
    activities: Activity[];
    maxItems?: number;
}

export const ActivityFeed = ({ activities, maxItems = 5 }: ActivityFeedProps) => {
    const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

    // Map actions to icons
    const actionIcons: Record<string, string> = {
        'created': '➕',
        'completed': '✅',
        'added comment': '💬',
        'updated': '✏️',
        'assigned': '👤',
        'started': '🚀',
        'reopened': '🔄'
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                {activities.length > maxItems && (
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View all
                    </button>
                )}
            </div>
            
            <ul className="space-y-4">
                {displayedActivities.map(activity => (
                    <li key={activity.id} className="flex items-start gap-3">
                        {/* User avatar */}
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            {activity.userAvatar ? (
                                <img 
                                    src={activity.userAvatar} 
                                    alt={activity.user} 
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-600 dark:text-gray-300">
                                    {activity.user.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        
                        {/* Activity content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {activity.user}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {activity.time}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <span className="inline-block mr-2">
                                    {activity.actionIcon || actionIcons[activity.action] || '⚡'}
                                </span>
                                <span className="capitalize">{activity.action}</span>{' '}
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {activity.target}
                                </span>
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
            
            {activities.length === 0 && (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No recent activity
                </p>
            )}
        </div>
    );
};