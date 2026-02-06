"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCookieData, getCookieData } from "@/utils/cookies";
import { getUserImage } from "@/services/api/users";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

interface UserData {
  id?: number;
  username?: string;
  email?: string;
  compcode?: string;
  role?: string;
  avatar?: string;
}

const UserIconMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const cookieData = getCookieData();

    if (cookieData) {
      setUser({
        username: cookieData.username || "",
        email: cookieData.email || "",
        role: cookieData.role || "",
        compcode: cookieData.compcode || ""
      });

      if (cookieData.username) {
        getUserImage()
          .then(imageUrl => {
            setUser(prev => ({
              ...prev,
              avatar: imageUrl.data || prev?.avatar
            }));
          })
          .catch(console.error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    deleteCookieData();
    router.push("/login");
  };

  if (!mounted || !user || !user.username) return null;

  return (
    <div className="relative z-[9999]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-2 py-1 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Open user menu</span>
        <div className="relative">
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={user.avatar || "/user.png"}
            alt={`${user.username}'s profile`}
          />
          <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
        </div>
        <span className="hidden text-sm font-semibold text-slate-700 md:block capitalize">
          {user.username}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200/70 bg-white shadow-[0_12px_30px_rgba(2,6,23,0.12)] overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={user.avatar || "/user.png"}
                alt={user.username}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate capitalize">
                  {user.username}
                </div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <UserIcon className="h-4 w-4 text-slate-400" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Cog6ToothIcon className="h-4 w-4 text-slate-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-slate-100 py-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserIconMenu;
