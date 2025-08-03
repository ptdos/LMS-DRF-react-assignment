import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Avatar from "../components/Avatar";

function UsersPage() {
  // Get the user's authentication token from context
  const { token } = useAuth();
  // Store the list of all users
  const [allUsers, setAllUsers] = useState([]);
  // Track if the current user is an admin
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  // useEffect runs when the component loads or when the token changes
  useEffect(() => {
    // This function checks if the user is an admin and fetches all users if so
    const checkAdminAndFetchUsers = async () => {
      try {
        // Get the current user's profile to check their role
        const profileResponse = await axios.get("http://localhost:8000/api/user/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUserData = profileResponse.data;
        // Show the user data in the console for learning purposes
        console.log("Current user profile:", currentUserData);
        if (currentUserData.role === "admin") {
          setIsCurrentUserAdmin(true);
          // If the user is an admin, get the list of all users
          const usersResponse = await axios.get("http://localhost:8000/api/user/auth/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const usersList = usersResponse.data;
          console.log("All users:", usersList);
          if (Array.isArray(usersList)) {
            setAllUsers(usersList);
          }
        } else {
          setIsCurrentUserAdmin(false);
          throw new Error("You are not an admin");
        }
      } catch (error) {
        // Show errors in the console for debugging
        console.error("There was a problem:", error);
      }
    };
    checkAdminAndFetchUsers();
  }, [token]);

  // If the user is not an admin, show an access denied message
  if (!isCurrentUserAdmin) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Sorry, You Can't View This Page</h2>
        <p className="text-gray-600">
          Only admin users can see the list of all users. If you think this is a mistake, please contact your administrator.
        </p>
      </div>
    );
  }

  // If the user is an admin, show the table of all users
  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-6xl text-center">
      <h2 className="text-2xl font-bold mb-6 text-green-600">List of All Users</h2>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-50">
            <tr>
              <th className="border px-4 py-2 text-center">Profile Picture</th>
              <th className="border px-4 py-2 text-left">Username</th>
              <th className="border px-4 py-2 text-left">Email Address</th>
              <th className="border px-4 py-2 text-left">User Role</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2"><Avatar name={user.username} /></td>
                <td className="border px-4 py-2 font-semibold">{user.username}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2 capitalize">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
