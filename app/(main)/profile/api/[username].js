import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Profile = () => {
  const router = useRouter();
  const { username } = router.query; // Get dynamic username from URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/home-owner/user?username=${username}`);
      const data = await res.json();
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!userData) return <p>No user found</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Profile</h1>
      <img
        src={userData.usr_profile_photo}
        alt="Profile"
        style={{ width: '150px', height: '150px', borderRadius: '50%' }}
      />
      <p><strong>Name:</strong> {`${userData.usr_first_name} ${userData.usr_last_name}`}</p>
      <p><strong>Username:</strong> {userData.usr_role}</p>
      <p><strong>Contact No:</strong> {userData.usr_phone}</p>
      <p><strong>Email Address:</strong> {userData.usr_email}</p>
    </div>
  );
};

export default Profile;
