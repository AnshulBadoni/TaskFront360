export const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => {
    return (
        <div className={`p-4 rounded-lg ${color} dark:bg-opacity-20`}>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};