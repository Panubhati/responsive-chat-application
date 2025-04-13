import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useState, useEffect } from "react";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser !== null) {
      setLoading(false); // User data is available, stop loading
    }
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>; // Show loading message or spinner while waiting for user data
  }

  const handleEditProfile = () => {
    console.log("Navigate to edit profile");
    // Implement your navigation or edit logic here
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img
          src={currentUser?.avatar || "./avatar.png"}
          alt="User Avatar"
        />
        <h3>{currentUser?.username || "Guest User"}</h3>
      </div>
      <div className="icons">
        <img src="./more.png" alt="More Options" />
        <img src="./video.png" alt="Video Call" />
        <img
          src="./edit.png"
          alt="Edit Profile"
          onClick={handleEditProfile} // Handle the edit profile click event
        />
      </div>
    </div>
  );
};

export default UserInfo;
