"use client";

import styles from './page.module.css';
import Image from 'next/image';
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Sidebar from '../../../components/sidebar.js';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import axios from 'axios';

export default function Profile({ params }) {
    const userId = params.userId;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [userFirstName, setUserFirstName] = useState("");
    const [userLastName, setUserLastName] = useState("");
    const [usr_username, setUserName] = useState("");
    const [usr_phone, setUserPhone] = useState("");
    const [usr_email, setUserEmail] = useState("");
    const [error, setError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newProfilePic, setNewProfilePic] = useState(null);
    const router = useRouter();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    // Fetch user data
    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/profile/${userId}`);
                    if (response.status != 200) throw new Error('Failed to fetch user data');

                    const data = response.data;
                    console.log("Fetched User Data:", data);

                    console.log(data)

                    // Populate all the fields with the fetched user data
                    setUserData(data);
                    setUserFirstName(data.userFirstName || "");
                    setUserLastName(data.userLastName || "");
                    setUserName(data.userUsername || "");
                    setUserPhone(data.userPhone || "");
                    setUserEmail(data.userEmail || "");
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError(error.message);
                }
            };

            fetchUserData();
        }
    }, [userId]);

    // Logout function
    const handleLogout = () => {
        signOut()
        router.push("/")
    };

    // Handle profile picture change
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProfilePic(URL.createObjectURL(file)); // Preview the selected profile picture
        }
    };

    // Handle profile update
    const handleProfileUpdate = async () => {
        const updatedData = {
            usr_first_name: userFirstName,
            usr_last_name: userLastName,
            usr_username: usr_username,
            usr_phone: usr_phone,
            usr_email: usr_email,
            new_password: newPassword,
        };

        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/profile/${userId}`, updatedData);
            const responseData =  response.data;
          

            // Re-fetch updated data
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/profile/${userId}`);
                    if (response.status != 200) throw new Error('Failed to fetch updated user data');
                    
                    const data = response.data
                    setUserFirstName(data.userFirstName || "");
                    setUserLastName(data.userLastName || "");
                    setUserName(data.userUsername || "");
                    setUserPhone(data.userPhone || "");
                    setUserEmail(data.userEmail || "");
                } catch (error) {
                    console.error('Error fetching updated user data:', error);
                    setError(error.message);
                }
            };

            await fetchUserData();
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message);
        }
    };

    return (
        <div className={styles.profile_container}>
            <Sidebar userId={userId}>
                <main className={styles.main_content}>
                    <header className={styles.dashboard_header}>
                        <h2>Profile</h2>
                        <div className={styles.profile} onClick={toggleDropdown} ref={dropdownRef}>
                            <div className={styles.profile_pic}>
                                <Image src="/profile-pic.png" alt="Profile" width={40} height={40} />
                            </div>
                            <div className={styles.profile_name}>{userFirstName} {userLastName}</div>
                            {dropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <ul>
                                        <li><Link href={`/profile/${userId}`}>Profile</Link></li>
                                        <li onClick={handleLogout}>Logout</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className={styles.profile_content}>
                        <div className={styles.left_column}>
                            <Image
                                src={newProfilePic || "/profile-pic.png"}
                                alt="Profile"
                                className={styles.profile_image}
                                width={150}
                                height={150}
                            />
                            <button className={styles.change_profile_button}>
                                <input 
                                    type="file" 
                                    style={{ display: 'none' }} 
                                    onChange={handleProfilePicChange} 
                                    id="fileInput" 
                                />
                                <label htmlFor="fileInput" className={styles.change_profile_button_label}>
                                    CHANGE PROFILE
                                </label>
                            </button>
                        </div>
                        <div className={styles.right_column}>
                            <div className={styles.profile_field}>
                                <label>Name:</label>
                                <input type="text" value={`${userFirstName} ${userLastName}`} readOnly />
                            </div>
                            <div className={styles.profile_field}>
                                <label>Username:</label>
                                <input 
                                    type="text" 
                                    value={usr_username} 
                                    onChange={(e) => setUserName(e.target.value)} 
                                />
                            </div>
                            <div className={styles.profile_field}>
                                <label>Contact No.:</label>
                                <input 
                                    type="numeric" 
                                    value={usr_phone} 
                                    onChange={(e) => setUserPhone(e.target.value)}
                                    maxlength="11"
                                    min="0"
                                />
                            </div>
                            <div className={styles.profile_field}>
                                <label>Email Address:</label>
                                <input 
                                type="text" 
                                value={usr_email} 
                                onChange={(e) => setUserEmail(e.target.value)} 
                            />

                            </div>
                            <div className={styles.profile_field}>
                                <label>Change Password:</label>
                                <input 
                                    type="password" 
                                    placeholder="New Password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                />
                            </div>
                            <button 
                                className={styles.update_profile_button}
                                onClick={handleProfileUpdate}
                            >
                                UPDATE PROFILE
                            </button>
                        </div>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                </main>
            </Sidebar>
        </div>
    );
}
