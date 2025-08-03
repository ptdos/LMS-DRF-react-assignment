import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Avatar from "../components/Avatar";

// Simple Modal component
// function Modal({ children, onClose }) {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-all">
//       <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[320px] relative animate-fadeIn">
//         <button
//           className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
//           onClick={onClose}
//           aria-label="Close"
//         >
//           &times;
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }
// 
function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/user/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        console.log("ProfilePage - User profile data:", data);
        setProfile(data);
        setForm({
          username: data?.username || "",
          email: data?.email || "",
          password: "",
        });
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    // Only include password if it's provided
    const updateData = { ...form };
    
    if (!updateData.password || updateData.password.trim() === "") 
    {
      delete updateData.password;
    }

    try {
      await axios.put("http://localhost:8000/api/user/profile/", updateData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Profile updated successfully!");
      setEditUserId(null);
      // Refresh profile data
      const { data } = await axios.get(
        "http://localhost:8000/api/user/profile/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(data);
    } catch (error) {
      setMessage("Update failed. Please try again.");
      console.error("Update error:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  if (!profile)
    return <div className="text-center text-gray-500">Loading...</div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center flex flex-col items-center">
      <Avatar name={profile.username} />
      <h2 className="text-2xl font-bold mb-2 mt-4 text-green-600">Profile</h2>
      {editUserId ? (
        <form
          onSubmit={handleUpdate}
          className="flex flex-col gap-4 w-full mt-2"
        >
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            readOnly
          />
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Enter new password (leave blank to keep current)"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <div className="text-xs text-gray-500 -mt-1">
            Leave password blank to keep your current password
          </div>
          <button
            className="bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow"
            type="submit"
          >
            Save
          </button>
          <button
            className="bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            type="button"
            onClick={() => setEditUserId(null)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="w-full flex flex-col items-center mt-4">
          <div className="mb-2 text-lg font-semibold text-gray-700">
            {profile.username}
          </div>
          <div className="mb-1 text-gray-500">{profile.email}</div>
          <div className="mb-4 text-sm text-blue-500 capitalize">
            {profile.role}
          </div>
          <button
            className="bg-yellow-400 text-white py-2 px-6 rounded-lg hover:bg-yellow-500 transition font-semibold shadow mb-2"
            onClick={() => setEditUserId(profile.id)}
          >
            Edit Profile
          </button>
        </div>
      )}
      {message && (
        <div className="mt-3 text-center text-sm text-green-500">{message}</div>
      )}
    </div>
  );
}

export default ProfilePage;
