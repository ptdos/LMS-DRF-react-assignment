import React from "react"; // Import the React library to use JSX and React features
import Avatar from "./Avatar"; // Import the Avatar component to display the user's initials

// Define the Topbar functional component, which takes several props:
// - user: the current user object (with username, email, role)
// - showProfile: boolean indicating if the profile dropdown is visible
// - setShowProfile: function to toggle the profile dropdown
// - logout: function to log the user out
// - setCurrentPage: function to change the current page
function Topbar({ user, showProfile, setShowProfile, logout, setCurrentPage }) {
  return (
    // The <header> element represents the top navigation bar
    <header
      className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 w-full shadow-sm"
      style={{ minHeight: "64px" }} // Set a minimum height for the topbar
    >
      <div className="flex-1"></div> {/* Empty div to help center the content */}
      <div className="relative flex-1 flex justify-end">
        {/* Button to show user info and toggle the profile dropdown */}
        <button
          className="flex items-center gap-3 focus:outline-none rounded-full hover:bg-blue-50 px-3 py-2 transition"
          onClick={() => setShowProfile((v) => !v)} // Toggle the profile dropdown on click
        >
          <Avatar name={user.username} /> {/* Show the user's avatar using initials */}
          <span className="hidden sm:block font-medium text-gray-700 text-sm">
            {user.username} {/* Show the username (hidden on small screens) */}
          </span>
          {/* Down arrow icon */}
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Profile dropdown menu, shown if showProfile is true */}
        {showProfile && (
          <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 animate-fade-in">
            {/* User info section */}
            <div className="p-4 border-b border-gray-100">
              <div className="font-semibold text-gray-700">{user.username}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
              <div className="text-xs text-blue-500 capitalize mt-1">{user.role}</div>
            </div>
            {/* Profile button */}
            <button
              className="w-full text-left px-4 py-2 hover:bg-blue-100 text-sm transition"
              onClick={() => {
                setShowProfile(false); // Close the dropdown
                setCurrentPage("profile"); // Navigate to the profile page
              }}
            >
              Profile
            </button>
            {/* Logout button */}
            <button
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-500 transition"
              onClick={logout} // Call the logout function
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar; // Export the Topbar component for use in other parts of the app