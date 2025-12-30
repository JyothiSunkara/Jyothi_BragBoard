import React, { useState } from "react";
import { Pencil } from "lucide-react";

const Header = ({ user, onLogout, onMenuToggle, setActiveView }) => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  return (
    <header className="bg-gradient-to-r from-white via-indigo-50 to-purple-50 backdrop-blur-sm shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LEFT SECTION: Hamburger + Logo */}
          <div className="flex items-center space-x-3">
            {/* 🌟 Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg border border-gray-200 bg-white hover:bg-violet-50 transition"
              onClick={onMenuToggle}
            >
              <svg
                className="w-5 h-5 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <div className="h-9 w-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-2 shadow-sm">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.8 4.7a3.4 3.4 0 001.9-.8 3.4 3.4 0 014.5 0 3.4 3.4 0 001.9.8 3.4 3.4 0 013.1 3.1 3.4 3.4 0 00.8 1.9 3.4 3.4 0 010 4.5 3.4 3.4 0 00-.8 1.9 3.4 3.4 0 01-3.1 3.1 3.4 3.4 0 00-1.9.8 3.4 3.4 0 01-4.5 0 3.4 3.4 0 00-1.9-.8 3.4 3.4 0 01-3.1-3.1 3.4 3.4 0 00-.8-1.9 3.4 3.4 0 010-4.5 3.4 3.4 0 00.8-1.9 3.4 3.4 0 013.1-3.1z"
                  />
                </svg>
              </div>

              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BragBoard
              </h1>
            </div>
          </div>

          {/* RIGHT SECTION: User Actions */}
          <div className="flex items-center space-x-4 relative">
            {/* Department (hide on mobile) */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600">Department:</span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {user?.department || "N/A"}
              </span>
            </div>

            {/* Role (hide on mobile) */}
            <div className="hidden md:flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {user?.role === "admin" ? "👑 Admin" : "👤 Employee"}
              </span>
            </div>

            {/* Avatar + Username */}
            <div className="flex items-center space-x-2">
              <div
                className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                onClick={() => setShowProfilePopup(!showProfilePopup)}
              >
                <span className="text-white text-sm font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>

              {/* hide username on small screens */}
              <span className="text-gray-700 font-medium hidden sm:block">
                {user?.username || "User"}
              </span>
            </div>

            {/* Desktop Logout (hide on mobile) */}
            <button
              onClick={onLogout}
              className="hidden md:flex bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 md:px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 
                  0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Popup */}
            {showProfilePopup && (
              <div className="absolute right-0 top-14 w-56 bg-gradient-to-r from-white via-indigo-50 to-purple-50 shadow-lg rounded-xl p-4 z-50 md:hidden">
                <div className="flex flex-col space-y-2">
                  {/* Username + Edit */}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-800">
                      {user?.username || "User"}
                    </div>

                    <button
                      onClick={() => {
                        setShowProfilePopup(false);
                        setActiveView("settings");
                      }}
                      className="p-1 rounded-md hover:bg-gray-100 transition"
                      title="Edit profile"
                    >
                      <Pencil size={16} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Email */}
                  <div className="text-sm text-gray-600 break-all">
                    Email: {user?.email || "email@example.com"}
                  </div>

                  {/* Department */}
                  <div className="text-sm text-gray-600">
                    Department: {user?.department || "N/A"}
                  </div>

                  {/* Role */}
                  <div className="text-sm text-gray-600">
                    Role: {user?.role === "admin" ? "👑 Admin" : "👤 Employee"}
                  </div>

                  {/* Logout */}
                  <button
                    onClick={onLogout}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
