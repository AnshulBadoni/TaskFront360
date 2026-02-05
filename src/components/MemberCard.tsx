import React from "react";

export interface Member {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  projects: {
    id: number;
    name: string;
  }[];
}

const colorPalette = [
  "bg-red-100 text-red-700",
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

const MemberCard = ({ member }: { member: Member }) => {
  const projectsPreview = member.projects.slice(0, 3);
  const extraCount = Math.max(0, member.projects.length - projectsPreview.length);
  const initials = member.username
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative rounded-xl bg-gray-white shadow-md border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="flex items-start gap-4 px-5 pt-5 ">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
          <img src={member.avatar || 'user.png'} alt={member.username} className="h-full w-full object-cover" />

        </div>

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center rounded-sm bg-violet-100 text-violet-700 text-[11px] font-semibold px-2.5 py-1 mb-2">
            {member.role || "Member"}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {member.username}
            </h3>
          </div>
          <p className="text-sm text-slate-500 truncate">{member.email}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 px-5 pb-10 ">
        {projectsPreview.map((project) => (
          <span
            key={project.id}
            className={`inline-flex items-center rounded-md ${colorPalette[Math.floor(Math.random() * colorPalette.length)]} text-[11px] font-semibold px-3 py-1`}
          >
            {project.name}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-600 text-[11px] font-semibold px-3 py-1">
            +{extraCount} more
          </span>
        )}
      </div>

      <div className="mt-5 absolute bottom-0 w-full flex items-center">
        <button className="flex-1 bg-slate-100 text-slate-700 text-xs font-semibold py-2 hover:bg-slate-200 transition-colors">
          View Profile
        </button>
        <button className="flex-1 bg-slate-800 text-white text-xs font-semibold py-2 hover:bg-slate-800 transition-colors">
          Chat
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
