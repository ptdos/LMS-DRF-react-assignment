import React from "react"; // Import the React library to use JSX and React features

// Define the Sidebar functional component, which takes three props:
// - sidebarOpen: boolean indicating if the sidebar is expanded
// - setSidebarOpen: function to toggle sidebar state
// - navItems: array of navigation items to display
function Sidebar({ sidebarOpen, setSidebarOpen, navItems }) {
  return (
    // The <aside> element represents the sidebar container
    <aside
      className={`h-screen flex flex-col py-6 px-2 transition-all duration-300 bg-white ${sidebarOpen ? "w-56" : "w-16"
        } border-r border-gray-100 shadow-sm`}
    // The sidebar width changes based on sidebarOpen (w-56 = expanded, w-16 = collapsed)
    >
      {/* Logo/title and collapse button section */}
      <div className="flex items-center justify-between mb-6 px-2">
        {/* App title or logo, changes based on sidebarOpen */}
        <span className="text-blue-600 font-extrabold text-xl tracking-tight">
          {sidebarOpen ? "LMS App" : "L"}
        </span>
        {/* Button to toggle sidebar open/collapse */}
        <button
          className="flex items-center justify-center rounded-lg hover:bg-blue-50 transition h-8 w-8"
          onClick={() => setSidebarOpen((v) => !v)} // Toggle sidebarOpen state on click
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} // Tooltip for accessibility
        >
          {/* Hamburger menu icon (SVG) */}
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {/* Three horizontal lines for the menu icon */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 flex flex-col gap-2 mt-2">
        {/* Map through navItems to render each navigation button */}
        {navItems.map((item) => (
          <button
            key={item.label} // Unique key for each nav item
            className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all text-left font-medium group 
              ${item.active ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"} 
              ${sidebarOpen ? "" : "justify-center px-2"}`}
            // Style changes if item is active or sidebar is collapsed
            onClick={item.onClick} // Call the item's onClick handler when clicked
          >
            {/* Icon for the nav item, always shown */}
            <span className="flex justify-center w-6">{item.icon}</span>
            {/* Label for the nav item, only shown if sidebar is open */}
            {sidebarOpen && <span className="ml-1">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar; // Export the Sidebar component for use in other parts of the app