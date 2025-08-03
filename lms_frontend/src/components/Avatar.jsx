import React from "react"; // Import the React library to use JSX and React features

// Define the Avatar functional component, which takes a 'name' prop
const Avatar = ({ name }) => {
  // Compute the initials from the provided name
  const initials = name
    ? name // If a name is provided
      .split(" ") // Split the name into an array of words (e.g., "John Doe" -> ["John", "Doe"])
      .map((n) => n[0]) // Map each word to its first character (e.g., ["J", "D"])
      .join("") // Join the initials together (e.g., "JD")
      .toUpperCase() // Convert the initials to uppercase
      .slice(0, 2) // Take only the first two characters (in case there are more)
    : "?"; // If no name is provided, use "?" as a placeholder

  // Render the avatar as a styled div containing the initials
  return (
    <div
      className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shadow-inner border border-blue-200"
    >
      {initials} {/* Display the computed initials or "?" */}
    </div>
  );
};

export default Avatar; // Export the Avatar component for use in other parts of the app