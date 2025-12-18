import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import dp from "../assets/dp.webp";
import {
  setOtherUsers,
  setSelectedUser,
  setUserData,
  setOnlineUsers,
} from "../redux/userSlice";
import { serverUrl } from "../main";

// --- Memoized Sub-Components ---

const UserCard = React.memo(({ user, selectedUser, onlineUsers, onClick }) => (
  <div
    onClick={onClick}
    className={`w-[95%] h-16 flex items-center gap-4 bg-white shadow-lg rounded-full px-3 cursor-pointer transition ${
      selectedUser?._id === user._id ? "bg-[#8cd6db]" : "hover:bg-[#8cd6db]"
    }`}
  >
    <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-lg relative">
      <img
        src={user?.image || dp}
        alt={user?.name}
        className="w-full h-full object-cover"
      />
      {onlineUsers?.includes(user._id) && (
        <span className="absolute bottom-0 right-0 w-[18px] h-[18px] bg-green-500 border-2 border-white rounded-full"></span>
      )}
    </div>
    <h1 className="text-gray-800 font-serif text-base truncate">
      {user.name || user.userName}
    </h1>
  </div>
));

const OnlineAvatar = React.memo(({ user, onClick }) => (
  <div
    onClick={onClick}
    className="w-14 h-14 rounded-full overflow-hidden shadow-lg cursor-pointer flex-shrink-0 bg-white relative border-2 border-transparent hover:border-[#20c7ff] transition"
  >
    <img
      src={user?.image || dp}
      alt={user?.name}
      className="w-full h-full object-cover"
    />
    <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
  </div>
));

const OnlineUsersBar = React.memo(({ users, onUserClick }) => {
  if (!users || users.length === 0) {
    return (
      <div className="flex items-center text-white/80 text-sm mt-4 px-4 min-h-[3.5rem]">
        No friends online
      </div>
    );
  }

  return (
    <div className="flex gap-3 mt-4 px-4 py-2 overflow-x-auto justify-start min-h-[3.5rem] no-scrollbar">
      {users.map((user) => (
        <OnlineAvatar key={user._id} user={user} onClick={() => onUserClick(user)} />
      ))}
    </div>
  );
});

// --- Main SideBar Component ---

function SideBar({ socket }) {
  const { userData, otherUsers, selectedUser, onlineUsers } = useSelector(
    (state) => state.user
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Fetch other users (Optimized Dependency Array)
  useEffect(() => {
    if (!userData?._id) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${serverUrl}/api/user/others`, { withCredentials: true });
        const others = res.data.filter((u) => u._id !== userData._id);
        dispatch(setOtherUsers(others));
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // dependency on userData?._id ensures it runs when user logs in
    // but avoids the infinite loop by not depending on otherUsers
  }, [userData?._id, dispatch]);

  // 2. Handle online users via socket (Fixed Debounce)
  useEffect(() => {
    if (!socket) return;
    let timeout;

    const handleOnlineUsers = (users) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        dispatch(setOnlineUsers(users));
      }, 500); // 500ms debounce to prevent UI flickering during heavy traffic
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      clearTimeout(timeout);
      socket.off("online-users", handleOnlineUsers);
    };
  }, [socket, dispatch]);

  // 3. Logout Logic
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      dispatch(setOtherUsers([]));
      dispatch(setSelectedUser(null));
      dispatch(setOnlineUsers([]));
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  // 4. Memoized Filtering logic
  const filteredUsers = useMemo(() => {
    const list = otherUsers || [];
    return list.filter((u) => 
      (u.name || u.userName || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [otherUsers, search]);

  const onlineFilteredUsers = useMemo(() => {
    return filteredUsers.filter((user) => onlineUsers?.includes(user._id));
  }, [filteredUsers, onlineUsers]);

  return (
    <div
      className={`lg:w-[45%] w-full h-full bg-slate-300 relative ${
        selectedUser ? "hidden lg:flex" : "flex"
      } flex-col`}
    >
      {/* Logout Desktop */}
      <button
        onClick={handleLogOut}
        className="hidden lg:flex items-center gap-2 cursor-pointer text-white absolute top-4 right-4 z-50 hover:opacity-80 transition"
      >
        <RiLogoutCircleLine className="w-6 h-6" />
        <span className="font-semibold">Logout</span>
      </button>

      {/* Logout Mobile */}
      <div
        onClick={handleLogOut}
        className="fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full flex items-center justify-center bg-[#20c7ff] shadow-lg cursor-pointer lg:hidden"
      >
        <RiLogoutCircleLine className="w-6 h-6 text-gray-800" />
      </div>

      {/* Header Section */}
      <div className="w-full h-[300px] bg-[#20c7ff] rounded-b-[30%] shadow-lg flex flex-col justify-center px-5 shrink-0">
        <h1 className="text-white font-bold font-mono text-2xl">Chatly</h1>

        <div className="w-full flex justify-between items-center mt-3">
          <h1 className="text-gray-800 font-serif text-xl">
            Hii, {userData?.name || "User"}
          </h1>
          <div
            className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow cursor-pointer bg-white"
            onClick={() => navigate("/profile")}
          >
            <img
              src={userData?.image || dp}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="w-full max-w-[550px] h-[60px] bg-white shadow-lg flex items-center gap-2 rounded-full px-4">
            <IoIosSearch className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full outline-none text-base text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <RxCross2 
                className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-600" 
                onClick={() => setSearch("")} 
              />
            )}
          </div>
        </div>

        <OnlineUsersBar
          users={onlineFilteredUsers}
          onUserClick={(user) => dispatch(setSelectedUser(user))}
        />
      </div>

      {/* Main List Section */}
      <div className="w-full flex-1 overflow-y-auto flex flex-col items-center gap-3 py-4 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center mt-10 gap-2">
             <div className="w-8 h-8 border-4 border-[#20c7ff] border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              onClick={() => dispatch(setSelectedUser(user))}
            />
          ))
        ) : (
          <p className="text-gray-500 mt-10">No users found</p>
        )}
      </div>
    </div>
  );
}

export default SideBar;